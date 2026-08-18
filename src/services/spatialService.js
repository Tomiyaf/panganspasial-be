import SpatialRepository from "../repositories/spatialRepository.js";
import { toFeature, toFeatureCollection, parseGeometry } from "../utils/geoJsonSerializer.js";

export class SpatialService {
  /**
   * Get Farms as GeoJSON FeatureCollection
   */
  static async getFarmsGeoJSON(filterOptions = {}) {
    let bboxArray = null;
    if (filterOptions.bbox) {
      const parts = filterOptions.bbox.split(",").map((v) => parseFloat(v.trim()));
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        bboxArray = parts;
      }
    }

    const rows = await SpatialRepository.getSpatialFarms({
      ...filterOptions,
      bbox: bboxArray,
    });

    const features = rows.map((r) => {
      let geometry = parseGeometry(r.geojson);
      if (!geometry && r.longitude && r.latitude) {
        geometry = {
          type: "Point",
          coordinates: [Number(r.longitude), Number(r.latitude)],
        };
      }

      const properties = {
        id: r.id,
        source_farm_id: r.source_farm_id,
        farm_name: r.farm_name,
        owner_name: r.owner_name,
        address: r.address,
        phone: r.phone,
        category: r.category_name,
        scale: r.scale_name,
        district: r.district_name,
        village: r.village_name,
        livestock_count: r.livestock_count,
        total_population: r.total_population,
      };

      return toFeature(geometry, properties, r.id);
    });

    return toFeatureCollection(features, {
      total: features.length,
      filters_applied: Object.keys(filterOptions).filter((k) => filterOptions[k]),
    });
  }

  /**
   * Get Districts as GeoJSON FeatureCollection
   */
  static async getDistrictsGeoJSON() {
    const rows = await SpatialRepository.getDistricts();

    const features = rows.map((r) => {
      const geometry = parseGeometry(r.geojson);
      const properties = {
        id: r.id,
        name: r.name,
        code: r.code,
        total_farms: r.total_farms,
        total_population: r.total_population,
      };
      return toFeature(geometry, properties, r.id);
    });

    return toFeatureCollection(features, { total: features.length });
  }

  /**
   * Get Villages as GeoJSON FeatureCollection
   */
  static async getVillagesGeoJSON(districtId = null) {
    const rows = await SpatialRepository.getVillages(districtId);

    const features = rows.map((r) => {
      const geometry = parseGeometry(r.geojson);
      const properties = {
        id: r.id,
        district_id: r.district_id,
        district_name: r.district_name,
        name: r.name,
        code: r.code,
        total_farms: r.total_farms,
        total_population: r.total_population,
      };
      return toFeature(geometry, properties, r.id);
    });

    return toFeatureCollection(features, { total: features.length });
  }

  /**
   * Get District Detail with Aggregates
   */
  static async getDistrictDetail(id) {
    const d = await SpatialRepository.getDistrictDetail(id);
    if (!d) {
      const err = new Error("District not found");
      err.status = 404;
      throw err;
    }
    return {
      id: d.id,
      name: d.name,
      code: d.code,
      total_farms: d.total_farms,
      total_villages: d.total_villages,
      total_population: d.total_population,
      geometry: parseGeometry(d.geojson),
    };
  }

  /**
   * Heatmap Data Endpoint (TASK-045, TASK-046)
   * Calculates weight dynamically based on livestock population and farm scale
   */
  static async getHeatmapData(filterOptions = {}) {
    const farms = await SpatialRepository.getSpatialFarms(filterOptions);

    const points = farms
      .filter((f) => f.latitude !== null && f.longitude !== null)
      .map((f) => {
        // Compute dynamic weight factor: scale multiplier + log(population + 1)
        let scaleMultiplier = 1;
        if (f.scale_name === "Besar") scaleMultiplier = 3;
        else if (f.scale_name === "Sedang") scaleMultiplier = 2;

        const popWeight = Math.log10(Number(f.total_population) + 1) + 0.5;
        const normalizedWeight = Number((popWeight * scaleMultiplier).toFixed(2));

        return {
          id: f.id,
          farm_name: f.farm_name,
          latitude: Number(f.latitude),
          longitude: Number(f.longitude),
          weight: normalizedWeight,
          population: f.total_population,
          scale: f.scale_name,
          district: f.district_name,
        };
      });

    return {
      points,
      count: points.length,
      bounds: points.length > 0 ? {
        minLat: Math.min(...points.map((p) => p.latitude)),
        maxLat: Math.max(...points.map((p) => p.latitude)),
        minLng: Math.min(...points.map((p) => p.longitude)),
        maxLng: Math.max(...points.map((p) => p.longitude)),
      } : null,
    };
  }
}

export default SpatialService;
