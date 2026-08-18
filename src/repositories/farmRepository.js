import prisma from "../lib/prisma.js";

export class FarmRepository {
  static async findMany({ where = {}, skip = 0, take = 20, orderBy = { id: "asc" } } = {}) {
    return prisma.farm.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        farm_category: true,
        farm_scale: true,
        district: true,
        village: true,
        livestock: {
          include: {
            livestock_category: true,
            livestock_type: true,
            livestock_subtype: true,
          },
        },
        farm_photos: {
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
        },
      },
    });
  }

  static async count({ where = {} } = {}) {
    return prisma.farm.count({ where });
  }

  static async findById(id) {
    return prisma.farm.findUnique({
      where: { id: BigInt(id) },
      include: {
        farm_category: true,
        farm_scale: true,
        district: true,
        village: true,
        livestock: {
          include: {
            livestock_category: true,
            livestock_type: true,
            livestock_subtype: true,
          },
        },
        farm_photos: {
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
        },
      },
    });
  }

  static async create(data) {
    const { longitude, latitude, ...rest } = data;
    const farm = await prisma.farm.create({
      data: {
        ...rest,
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
      },
    });

    if (longitude !== null && latitude !== null && longitude !== undefined && latitude !== undefined) {
      await prisma.$executeRaw`
        UPDATE farms 
        SET geom = ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
        WHERE id = ${farm.id}
      `;
    }

    return this.findById(farm.id);
  }

  static async update(id, data) {
    const { longitude, latitude, ...rest } = data;
    await prisma.farm.update({
      where: { id: BigInt(id) },
      data: {
        ...rest,
        ...(latitude !== undefined && { latitude: latitude !== null ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude !== null ? Number(longitude) : null }),
      },
    });

    if (longitude !== undefined && latitude !== undefined && longitude !== null && latitude !== null) {
      await prisma.$executeRaw`
        UPDATE farms 
        SET geom = ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
        WHERE id = ${BigInt(id)}
      `;
    }

    return this.findById(id);
  }

  static async delete(id) {
    return prisma.$transaction([
      prisma.livestock.deleteMany({ where: { farm_id: BigInt(id) } }),
      prisma.farmPhoto.deleteMany({ where: { farm_id: BigInt(id) } }),
      prisma.farm.delete({ where: { id: BigInt(id) } }),
    ]);
  }
}

export default FarmRepository;
