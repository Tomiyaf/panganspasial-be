import "dotenv/config";
import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma.js";

async function testPostGISGeom() {
  const dataPath = path.resolve(process.cwd(), "gpkg_boundaries.json");
  const boundaries = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`Loaded ${boundaries.length} boundaries to test with ST_Force2D...`);

  for (const b of boundaries) {
    const result = await prisma.$queryRaw`
      SELECT 
        ST_GeometryType(ST_Force2D(ST_Multi(ST_CurveToLine(ST_SetSRID(ST_GeomFromWKB(decode(${b.wkb_hex}, 'hex')), 4326))))) as geom_type,
        ST_IsValid(ST_Force2D(ST_Multi(ST_CurveToLine(ST_SetSRID(ST_GeomFromWKB(decode(${b.wkb_hex}, 'hex')), 4326))))) as is_valid,
        ST_CoordDim(ST_Force2D(ST_Multi(ST_CurveToLine(ST_SetSRID(ST_GeomFromWKB(decode(${b.wkb_hex}, 'hex')), 4326))))) as dim,
        substring(ST_AsGeoJSON(ST_Force2D(ST_Multi(ST_CurveToLine(ST_SetSRID(ST_GeomFromWKB(decode(${b.wkb_hex}, 'hex')), 4326))))), 1, 50) as geojson_snippet
    `;
    console.log(`- ${b.district} / ${b.name}: Type = ${result[0].geom_type}, Dim = ${result[0].dim}, Valid = ${result[0].is_valid}`);
  }
}

testPostGISGeom()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
