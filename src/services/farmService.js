import FarmRepository from "../repositories/farmRepository.js";

export class FarmService {
  static async getFarms({
    page = 1,
    limit = 20,
    search = "",
    district_id = null,
    village_id = null,
    farm_category_id = null,
    farm_scale_id = null,
    livestock_type_id = null,
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { farm_name: { contains: search, mode: "insensitive" } },
        { owner_name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (district_id) where.district_id = BigInt(district_id);
    if (village_id) where.village_id = BigInt(village_id);
    if (farm_category_id) where.farm_category_id = BigInt(farm_category_id);
    if (farm_scale_id) where.farm_scale_id = BigInt(farm_scale_id);
    if (livestock_type_id) {
      where.livestock = {
        some: { livestock_type_id: BigInt(livestock_type_id) },
      };
    }

    const [total, items] = await Promise.all([
      FarmRepository.count({ where }),
      FarmRepository.findMany({ where, skip, take: limitNum }),
    ]);

    const formattedItems = items.map((f) => {
      const totalPopulation = f.livestock.reduce((sum, l) => sum + (l.population || 0), 0);
      const primaryPhoto = f.farm_photos.find((p) => p.is_primary) || f.farm_photos[0] || null;

      return {
        id: f.id,
        source_farm_id: f.source_farm_id,
        farm_name: f.farm_name,
        owner_name: f.owner_name,
        address: f.address,
        phone: f.phone,
        notes: f.notes,
        latitude: f.latitude ? Number(f.latitude) : null,
        longitude: f.longitude ? Number(f.longitude) : null,
        category: f.farm_category ? f.farm_category.name : null,
        category_id: f.farm_category_id,
        scale: f.farm_scale ? f.farm_scale.name : null,
        scale_id: f.farm_scale_id,
        district: f.district ? f.district.name : null,
        district_id: f.district_id,
        village: f.village ? f.village.name : null,
        village_id: f.village_id,
        total_livestock_count: f.livestock.length,
        total_population: totalPopulation,
        primary_photo: primaryPhoto ? primaryPhoto.file_path : null,
        created_at: f.created_at,
        updated_at: f.updated_at,
      };
    });

    return {
      items: formattedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getFarmById(id) {
    const f = await FarmRepository.findById(id);
    if (!f) {
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    const totalPopulation = f.livestock.reduce((sum, l) => sum + (l.population || 0), 0);

    return {
      id: f.id,
      source_farm_id: f.source_farm_id,
      farm_name: f.farm_name,
      owner_name: f.owner_name,
      address: f.address,
      phone: f.phone,
      notes: f.notes,
      latitude: f.latitude ? Number(f.latitude) : null,
      longitude: f.longitude ? Number(f.longitude) : null,
      category: f.farm_category,
      scale: f.farm_scale,
      district: f.district,
      village: f.village,
      category_id: f.farm_category_id ? Number(f.farm_category_id) : null,
      farm_category_id: f.farm_category_id ? Number(f.farm_category_id) : null,
      farm_category: f.farm_category,
      scale_id: f.farm_scale_id ? Number(f.farm_scale_id) : null,
      farm_scale_id: f.farm_scale_id ? Number(f.farm_scale_id) : null,
      farm_scale: f.farm_scale,
      district_id: f.district_id ? Number(f.district_id) : null,
      village_id: f.village_id ? Number(f.village_id) : null,
      livestock: f.livestock.map((l) => ({
        id: l.id,
        source_livestock_id: l.source_livestock_id,
        category: l.livestock_category.name,
        type: l.livestock_type.name,
        subtype: l.livestock_subtype ? l.livestock_subtype.name : null,
        population: l.population,
      })),
      total_population: totalPopulation,
      photos: f.farm_photos,
      created_at: f.created_at,
      updated_at: f.updated_at,
    };
  }

  static async createFarm(data) {
    const formattedData = {
      farm_name: data.farm_name,
      owner_name: data.owner_name,
      address: data.address,
      phone: data.phone,
      notes: data.notes,
      latitude: data.latitude,
      longitude: data.longitude,
      ...(data.farm_category_id && { farm_category_id: BigInt(data.farm_category_id) }),
      ...(data.farm_scale_id && { farm_scale_id: BigInt(data.farm_scale_id) }),
      ...(data.district_id && { district_id: BigInt(data.district_id) }),
      ...(data.village_id && { village_id: BigInt(data.village_id) }),
    };

    return FarmRepository.create(formattedData);
  }

  static async updateFarm(id, data) {
    await this.getFarmById(id);

    const formattedData = {
      ...(data.farm_name !== undefined && { farm_name: data.farm_name }),
      ...(data.owner_name !== undefined && { owner_name: data.owner_name }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.farm_category_id !== undefined && {
        farm_category_id: data.farm_category_id ? BigInt(data.farm_category_id) : null,
      }),
      ...(data.farm_scale_id !== undefined && {
        farm_scale_id: data.farm_scale_id ? BigInt(data.farm_scale_id) : null,
      }),
      ...(data.district_id !== undefined && {
        district_id: data.district_id ? BigInt(data.district_id) : null,
      }),
      ...(data.village_id !== undefined && {
        village_id: data.village_id ? BigInt(data.village_id) : null,
      }),
    };

    return FarmRepository.update(id, formattedData);
  }

  static async deleteFarm(id) {
    await this.getFarmById(id);
    return FarmRepository.delete(id);
  }
}

export default FarmService;
