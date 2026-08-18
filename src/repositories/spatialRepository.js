import prisma from "../lib/prisma.js";

export class SpatialRepository {
  /**
   * Query spatial farms with PostGIS GeoJSON and multi-filters + BBox
   */
  static async getSpatialFarms({
    district_id = null,
    village_id = null,
    farm_category_id = null,
    farm_scale_id = null,
    livestock_type_id = null,
    search = null,
    bbox = null, // [minLng, minLat, maxLng, maxLat]
  } = {}) {
    // Build raw SQL query with PostGIS ST_AsGeoJSON
    let query = `
      SELECT 
        f.id,
        f.source_farm_id,
        f.farm_name,
        f.owner_name,
        f.address,
        f.phone,
        f.latitude,
        f.longitude,
        fc.name as category_name,
        fs.name as scale_name,
        d.name as district_name,
        v.name as village_name,
        COALESCE(SUM(l.population), 0)::int as total_population,
        COUNT(l.id)::int as livestock_count,
        ST_AsGeoJSON(f.geom) as geojson
      FROM farms f
      LEFT JOIN farm_categories fc ON f.farm_category_id = fc.id
      LEFT JOIN farm_scales fs ON f.farm_scale_id = fs.id
      LEFT JOIN districts d ON f.district_id = d.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN livestock l ON f.id = l.farm_id
      WHERE f.geom IS NOT NULL
    `;

    const params = [];
    let paramIndex = 1;

    if (district_id) {
      query += ` AND f.district_id = $${paramIndex++}`;
      params.push(BigInt(district_id));
    }

    if (village_id) {
      query += ` AND f.village_id = $${paramIndex++}`;
      params.push(BigInt(village_id));
    }

    if (farm_category_id) {
      query += ` AND f.farm_category_id = $${paramIndex++}`;
      params.push(BigInt(farm_category_id));
    }

    if (farm_scale_id) {
      query += ` AND f.farm_scale_id = $${paramIndex++}`;
      params.push(BigInt(farm_scale_id));
    }

    if (livestock_type_id) {
      query += ` AND EXISTS (SELECT 1 FROM livestock l2 WHERE l2.farm_id = f.id AND l2.livestock_type_id = $${paramIndex++})`;
      params.push(BigInt(livestock_type_id));
    }

    if (search) {
      query += ` AND (f.farm_name ILIKE $${paramIndex} OR f.owner_name ILIKE $${paramIndex} OR f.address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Bounding Box filter (TASK-037)
    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      query += ` AND ST_Within(f.geom, ST_MakeEnvelope($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, 4326))`;
      params.push(Number(minLng), Number(minLat), Number(maxLng), Number(maxLat));
    }

    query += `
      GROUP BY f.id, fc.name, fs.name, d.name, v.name
      ORDER BY f.id ASC
    `;

    return prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * Get all districts with GeoJSON
   */
  static async getDistricts() {
    const query = `
      SELECT 
        d.id,
        d.name,
        d.code,
        COUNT(DISTINCT f.id)::int as total_farms,
        COALESCE(SUM(l.population), 0)::int as total_population,
        ST_AsGeoJSON(d.geom) as geojson
      FROM districts d
      LEFT JOIN farms f ON d.id = f.district_id
      LEFT JOIN livestock l ON f.id = l.farm_id
      GROUP BY d.id
      ORDER BY d.name ASC;
    `;
    return prisma.$queryRawUnsafe(query);
  }

  /**
   * Get all villages with GeoJSON and optional district filter
   */
  static async getVillages(districtId = null) {
    let query = `
      SELECT 
        v.id,
        v.district_id,
        d.name as district_name,
        v.name,
        v.code,
        COUNT(DISTINCT f.id)::int as total_farms,
        COALESCE(SUM(l.population), 0)::int as total_population,
        ST_AsGeoJSON(v.geom) as geojson
      FROM villages v
      JOIN districts d ON v.district_id = d.id
      LEFT JOIN farms f ON v.id = f.village_id
      LEFT JOIN livestock l ON f.id = l.farm_id
    `;

    const params = [];
    if (districtId) {
      query += ` WHERE v.district_id = $1`;
      params.push(BigInt(districtId));
    }

    query += `
      GROUP BY v.id, d.name
      ORDER BY d.name ASC, v.name ASC;
    `;

    return prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * Get district detail with aggregates
   */
  static async getDistrictDetail(id) {
    const query = `
      SELECT 
        d.id,
        d.name,
        d.code,
        COUNT(DISTINCT f.id)::int as total_farms,
        COUNT(DISTINCT v.id)::int as total_villages,
        COALESCE(SUM(l.population), 0)::int as total_population,
        ST_AsGeoJSON(d.geom) as geojson
      FROM districts d
      LEFT JOIN villages v ON d.id = v.district_id
      LEFT JOIN farms f ON d.id = f.district_id
      LEFT JOIN livestock l ON f.id = l.farm_id
      WHERE d.id = $1
      GROUP BY d.id;
    `;
    const rows = await prisma.$queryRawUnsafe(query, BigInt(id));
    return rows[0] || null;
  }
}

export default SpatialRepository;
