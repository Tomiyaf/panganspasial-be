import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Roles (TASK-008)
  console.log("-> Seeding roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator sistem dengan hak akses penuh",
    },
  });
  console.log("   ✓ Role Admin ready (ID:", adminRole.id.toString(), ")");

  // 2. Seed Default Admin User
  console.log("-> Seeding default admin user...");
  const hashedPassword = await bcrypt.hash("Admin#2026", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@panganspasial.id" },
    update: {},
    create: {
      role_id: adminRole.id,
      name: "Administrator Panganspasial",
      email: "admin@panganspasial.id",
      password: hashedPassword,
      is_active: true,
    },
  });
  console.log("   ✓ Admin user ready (email:", adminUser.email, ")");

  // 3. Seed Farm Categories (TASK-009)
  console.log("-> Seeding farm categories...");
  const farmCategories = [
    { name: "Industri", description: "Peternakan skala industri komersial" },
    { name: "Rumah Tangga", description: "Peternakan skala rumah tangga / mandiri" },
  ];

  for (const cat of farmCategories) {
    await prisma.farmCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }
  console.log("   ✓ Farm categories seeded (Industri, Rumah Tangga)");

  // 4. Seed Farm Scales (TASK-009)
  console.log("-> Seeding farm scales...");
  const farmScales = [
    { name: "Besar", description: "Skala peternakan besar" },
    { name: "Sedang", description: "Skala peternakan sedang" },
    { name: "Kecil", description: "Skala peternakan kecil" },
  ];

  for (const scale of farmScales) {
    await prisma.farmScale.upsert({
      where: { name: scale.name },
      update: { description: scale.description },
      create: scale,
    });
  }
  console.log("   ✓ Farm scales seeded (Besar, Sedang, Kecil)");

  // 5. Seed Livestock Categories (TASK-010)
  console.log("-> Seeding livestock categories...");
  const livestockCategories = [
    { name: "Ruminansia", description: "Hewan mamalia pemamah biak" },
    { name: "Unggas", description: "Hewan ternak bersayap/unggas" },
  ];

  const catMap = {};
  for (const cat of livestockCategories) {
    const created = await prisma.livestockCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
    catMap[cat.name] = created.id;
  }
  console.log("   ✓ Livestock categories seeded (Ruminansia, Unggas)");

  // 6. Seed Livestock Types (TASK-010)
  console.log("-> Seeding livestock types...");
  const livestockTypes = [
    { category_id: catMap["Ruminansia"], name: "Sapi", description: "Ternak sapi potong/perah" },
    { category_id: catMap["Ruminansia"], name: "Kambing", description: "Ternak kambing" },
    { category_id: catMap["Unggas"], name: "Ayam", description: "Ternak ayam" },
  ];

  const typeMap = {};
  for (const type of livestockTypes) {
    const created = await prisma.livestockType.upsert({
      where: {
        category_id_name: {
          category_id: type.category_id,
          name: type.name,
        },
      },
      update: { description: type.description },
      create: type,
    });
    typeMap[type.name] = created.id;
  }
  console.log("   ✓ Livestock types seeded (Sapi, Kambing, Ayam)");

  // 7. Seed Livestock Subtypes (TASK-010)
  console.log("-> Seeding livestock subtypes...");
  const livestockSubtypes = [
    { livestock_type_id: typeMap["Ayam"], name: "Petelur", description: "Ayam petelur" },
    { livestock_type_id: typeMap["Ayam"], name: "Pedaging", description: "Ayam pedaging / broiler" },
  ];

  for (const sub of livestockSubtypes) {
    await prisma.livestockSubtype.upsert({
      where: {
        livestock_type_id_name: {
          livestock_type_id: sub.livestock_type_id,
          name: sub.name,
        },
      },
      update: { description: sub.description },
      create: sub,
    });
  }
  console.log("   ✓ Livestock subtypes seeded (Petelur, Pedaging)");

  // 8. Seed SDSS Criteria Initial Baseline (TASK-047/048)
  console.log("-> Seeding SDSS criteria...");
  const sdssCriteria = [
    { name: "Populasi Ternak", description: "Kepadatan populasi ternak", criteria_type: "benefit", weight: 0.30, is_active: true },
    { name: "Jumlah Peternakan", description: "Konsentrasi unit usaha peternakan", criteria_type: "benefit", weight: 0.25, is_active: true },
    { name: "Dukungan Wilayah", description: "Luas wilayah dan ketersediaan lahan", criteria_type: "benefit", weight: 0.25, is_active: true },
    { name: "Kategori Peternakan", description: "Proporsi industri vs rumah tangga", criteria_type: "benefit", weight: 0.20, is_active: true },
  ];

  for (const crit of sdssCriteria) {
    await prisma.sdssCriterion.upsert({
      where: { name: crit.name },
      update: {
        description: crit.description,
        criteria_type: crit.criteria_type,
        weight: crit.weight,
        is_active: crit.is_active,
      },
      create: crit,
    });
  }
  console.log("   ✓ SDSS criteria seeded");

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
