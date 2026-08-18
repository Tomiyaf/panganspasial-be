import "dotenv/config";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";

const DISTRICTS_DATA = [
  { name: "Adiluwih", code: "18.10.08" },
  { name: "Pringsewu", code: "18.10.01" },
  { name: "Gadingrejo", code: "18.10.02" },
  { name: "Ambarawa", code: "18.10.03" },
  { name: "Pardasuka", code: "18.10.04" },
  { name: "Pagelaran", code: "18.10.05" },
  { name: "Banyumas", code: "18.10.06" },
  { name: "Sukoharjo", code: "18.10.07" },
  { name: "Pagelaran Utara", code: "18.10.09" },
];

export async function importGpkgData() {
  console.log("🚜 Starting GPKG Import Pipeline...");

  const dataFilePath = path.resolve(process.cwd(), "gpkg_data.json");
  if (!fs.existsSync(dataFilePath)) {
    throw new Error("gpkg_data.json not found. Please extract GPKG first.");
  }

  const rawData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  const { farms, livestock } = rawData;

  console.log(`📊 Found ${farms.length} farms and ${livestock.length} livestock records in source.`);

  // 1. Seed / Upsert Districts (TASK-011)
  console.log("-> Processing Districts...");
  const districtMap = new Map();
  for (const d of DISTRICTS_DATA) {
    const district = await prisma.district.upsert({
      where: { name: d.name },
      update: { code: d.code },
      create: { name: d.name, code: d.code },
    });
    districtMap.set(d.name.toLowerCase(), district.id);
  }

  // 2. Cache Master Data
  const categories = await prisma.farmCategory.findMany();
  const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  const scales = await prisma.farmScale.findMany();
  const scaleMap = new Map(scales.map((s) => [s.name.toLowerCase(), s.id]));

  const livestockCategories = await prisma.livestockCategory.findMany();
  const livestockCategoryMap = new Map(livestockCategories.map((c) => [c.name.toLowerCase(), c.id]));

  const livestockTypes = await prisma.livestockType.findMany();
  const livestockTypeMap = new Map(livestockTypes.map((t) => [t.name.toLowerCase(), t.id]));

  const livestockSubtypes = await prisma.livestockSubtype.findMany();
  const livestockSubtypeMap = new Map(livestockSubtypes.map((s) => [s.name.toLowerCase(), s.id]));

  // Helper to detect district from address
  const detectDistrictId = (address) => {
    if (!address) return districtMap.get("adiluwih"); // default based on GPKG cluster
    const addr = address.toLowerCase();
    for (const [name, id] of districtMap.entries()) {
      if (addr.includes(name)) return id;
    }
    return districtMap.get("adiluwih");
  };

  // Helper to detect/create village from address
  const villageMap = new Map();
  const getOrCreateVillageId = async (address, districtId) => {
    if (!address) return null;
    let villageName = null;

    // Detect common village names in Pringsewu GPKG
    const knownVillages = [
      "Srikaton", "Kuta Waringin", "Kita Waringin", "Kutawaringin",
      "TotoKarto", "Totokarto", "Bandung Baru", "Tunggul Pawenang",
      "Enggalrejo", "Waringinsari Timur", "Adiluwih", "Pringgodani",
      "Sukoharjo", "Sinar Baru", "Podomoro", "Podosari"
    ];

    for (const v of knownVillages) {
      if (address.toLowerCase().includes(v.toLowerCase())) {
        villageName = v === "Kita Waringin" ? "Kuta Waringin" : (v === "Totokarto" ? "TotoKarto" : v);
        break;
      }
    }

    if (!villageName) return null;

    const key = `${districtId}_${villageName.toLowerCase()}`;
    if (villageMap.has(key)) return villageMap.get(key);

    const village = await prisma.village.upsert({
      where: {
        district_id_name: {
          district_id: districtId,
          name: villageName,
        },
      },
      update: {},
      create: {
        district_id: districtId,
        name: villageName,
      },
    });

    villageMap.set(key, village.id);
    return village.id;
  };

  // 3. Import Farms (TASK-013)
  console.log("-> Importing Farms...");
  const farmIdMapping = new Map(); // source_farm_id -> db.id

  for (const f of farms) {
    const districtId = detectDistrictId(f.address);
    const villageId = await getOrCreateVillageId(f.address, districtId);
    const categoryId = f.farm_category ? categoryMap.get(f.farm_category.toLowerCase()) : null;
    const scaleId = f.scale ? scaleMap.get(f.scale.toLowerCase()) : null;

    const farmRecord = await prisma.farm.upsert({
      where: { source_farm_id: BigInt(f.farm_id) },
      update: {
        farm_name: f.farm_name,
        owner_name: f.owner_name,
        address: f.address,
        phone: f.phone,
        farm_category_id: categoryId,
        farm_scale_id: scaleId,
        district_id: districtId,
        village_id: villageId,
        notes: f.notes,
        latitude: f.latitude,
        longitude: f.longitude,
      },
      create: {
        source_farm_id: BigInt(f.farm_id),
        farm_name: f.farm_name,
        owner_name: f.owner_name,
        address: f.address,
        phone: f.phone,
        farm_category_id: categoryId,
        farm_scale_id: scaleId,
        district_id: districtId,
        village_id: villageId,
        notes: f.notes,
        latitude: f.latitude,
        longitude: f.longitude,
      },
    });

    farmIdMapping.set(Number(f.farm_id), farmRecord.id);

    // Update PostGIS spatial point geometry
    if (f.latitude !== null && f.longitude !== null) {
      await prisma.$executeRaw`
        UPDATE farms 
        SET geom = ST_SetSRID(ST_MakePoint(${f.longitude}, ${f.latitude}), 4326)
        WHERE id = ${farmRecord.id}
      `;
    }
  }
  console.log(`   ✓ ${farms.length} Farms imported and geometries updated.`);

  // 4. Import Livestock (TASK-013)
  console.log("-> Importing Livestock...");
  for (const l of livestock) {
    const dbFarmId = farmIdMapping.get(Number(l.farm_id));
    if (!dbFarmId) {
      console.warn(`⚠️ Warning: Farm ID ${l.farm_id} not found for livestock ${l.livestock_id}`);
      continue;
    }

    const catId = l.livestock_category ? livestockCategoryMap.get(l.livestock_category.toLowerCase()) : null;
    const typeId = l.livestock_type ? livestockTypeMap.get(l.livestock_type.toLowerCase()) : null;
    const subtypeId = l.livestock_subtype ? livestockSubtypeMap.get(l.livestock_subtype.toLowerCase()) : null;

    if (!catId || !typeId) {
      console.warn(`⚠️ Missing category or type for livestock ${l.livestock_id}`);
      continue;
    }

    await prisma.livestock.upsert({
      where: { source_livestock_id: BigInt(l.livestock_id) },
      update: {
        farm_id: dbFarmId,
        livestock_category_id: catId,
        livestock_type_id: typeId,
        livestock_subtype_id: subtypeId,
        population: l.population || 0,
      },
      create: {
        source_livestock_id: BigInt(l.livestock_id),
        farm_id: dbFarmId,
        livestock_category_id: catId,
        livestock_type_id: typeId,
        livestock_subtype_id: subtypeId,
        population: l.population || 0,
      },
    });
  }
  console.log(`   ✓ ${livestock.length} Livestock imported.`);

  // 5. Validation Check (TASK-014)
  console.log("-> Running Post-Import Integrity Validations (TASK-014)...");
  const totalFarms = await prisma.farm.count();
  const totalLivestock = await prisma.livestock.count();
  const geomCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM farms WHERE geom IS NOT NULL;`;
  const validGeomCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM farms WHERE ST_IsValid(geom);`;
  const orphanCheck = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM livestock l 
    LEFT JOIN farms f ON l.farm_id = f.id 
    WHERE f.id IS NULL;
  `;

  console.log("\n=========================================");
  console.log("🏆 GPKG IMPORT SUMMARY & VERIFICATION");
  console.log("=========================================");
  console.log(`• Total Farms in DB:          ${totalFarms} (Expected: 40)`);
  console.log(`• Total Livestock in DB:      ${totalLivestock} (Expected: 41)`);
  console.log(`• Farms with Geometry:        ${geomCount[0].count} / 40`);
  console.log(`• Valid PostGIS Geometries:   ${validGeomCount[0].count} / 40`);
  console.log(`• Orphan Livestock Records:   ${orphanCheck[0].count} (Expected: 0)`);
  console.log("=========================================\n");

  if (totalFarms !== 40 || totalLivestock !== 41 || Number(orphanCheck[0].count) !== 0) {
    throw new Error("❌ Validation failed! Expected 40 farms, 41 livestock, and 0 orphans.");
  }

  console.log("✅ GPKG Import Pipeline completed and verified successfully!");
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith("gpkgImporter.js")) {
  importGpkgData()
    .catch((err) => {
      console.error("❌ Import error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
