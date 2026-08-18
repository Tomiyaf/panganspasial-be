import prisma from "../lib/prisma.js";

export class LivestockService {
  static async getLivestockByFarm(farmId) {
    return prisma.livestock.findMany({
      where: { farm_id: BigInt(farmId) },
      include: {
        livestock_category: true,
        livestock_type: true,
        livestock_subtype: true,
      },
    });
  }

  static async getLivestockById(id) {
    const item = await prisma.livestock.findUnique({
      where: { id: BigInt(id) },
      include: {
        farm: true,
        livestock_category: true,
        livestock_type: true,
        livestock_subtype: true,
      },
    });
    if (!item) {
      const err = new Error("Livestock record not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  /**
   * Validate category -> type -> subtype hierarchy
   */
  static async validateHierarchy({ category_id, type_id, subtype_id }) {
    const type = await prisma.livestockType.findUnique({
      where: { id: BigInt(type_id) },
    });

    if (!type) {
      const err = new Error(`Livestock type with ID ${type_id} does not exist`);
      err.status = 400;
      throw err;
    }

    if (category_id && type.category_id !== BigInt(category_id)) {
      const err = new Error(
        `Hierarchy mismatch: Type '${type.name}' does not belong to Category ID ${category_id}`
      );
      err.status = 400;
      throw err;
    }

    const resolvedCategoryId = type.category_id;

    if (subtype_id) {
      const subtype = await prisma.livestockSubtype.findUnique({
        where: { id: BigInt(subtype_id) },
      });

      if (!subtype) {
        const err = new Error(`Livestock subtype with ID ${subtype_id} does not exist`);
        err.status = 400;
        throw err;
      }

      if (subtype.livestock_type_id !== BigInt(type_id)) {
        const err = new Error(
          `Hierarchy mismatch: Subtype '${subtype.name}' does not belong to Type '${type.name}'`
        );
        err.status = 400;
        throw err;
      }
    }

    return { categoryId: resolvedCategoryId, typeId: BigInt(type_id) };
  }

  static async createLivestock(farmId, data) {
    // Validate farm exists
    const farm = await prisma.farm.findUnique({ where: { id: BigInt(farmId) } });
    if (!farm) {
      const err = new Error("Farm not found");
      err.status = 404;
      throw err;
    }

    const { categoryId, typeId } = await this.validateHierarchy({
      category_id: data.livestock_category_id,
      type_id: data.livestock_type_id,
      subtype_id: data.livestock_subtype_id,
    });

    return prisma.livestock.create({
      data: {
        farm_id: BigInt(farmId),
        livestock_category_id: categoryId,
        livestock_type_id: typeId,
        livestock_subtype_id: data.livestock_subtype_id ? BigInt(data.livestock_subtype_id) : null,
        population: Math.max(0, parseInt(data.population, 10) || 0),
      },
      include: {
        livestock_category: true,
        livestock_type: true,
        livestock_subtype: true,
      },
    });
  }

  static async updateLivestock(id, data) {
    const existing = await this.getLivestockById(id);

    const typeId = data.livestock_type_id || existing.livestock_type_id;
    const categoryId = data.livestock_category_id || existing.livestock_category_id;
    const subtypeId = data.livestock_subtype_id !== undefined ? data.livestock_subtype_id : existing.livestock_subtype_id;

    const validated = await this.validateHierarchy({
      category_id: categoryId,
      type_id: typeId,
      subtype_id: subtypeId,
    });

    return prisma.livestock.update({
      where: { id: BigInt(id) },
      data: {
        livestock_category_id: validated.categoryId,
        livestock_type_id: validated.typeId,
        livestock_subtype_id: subtypeId ? BigInt(subtypeId) : null,
        ...(data.population !== undefined && { population: Math.max(0, parseInt(data.population, 10) || 0) }),
      },
      include: {
        livestock_category: true,
        livestock_type: true,
        livestock_subtype: true,
      },
    });
  }

  static async deleteLivestock(id) {
    await this.getLivestockById(id);
    return prisma.livestock.delete({ where: { id: BigInt(id) } });
  }
}

export default LivestockService;
