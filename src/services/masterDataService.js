import prisma from "../lib/prisma.js";

export class MasterDataService {
  // ==================== FARM CATEGORIES ====================
  static async getFarmCategories() {
    return prisma.farmCategory.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { farms: true } } },
    });
  }

  static async getFarmCategoryById(id) {
    const item = await prisma.farmCategory.findUnique({ where: { id: BigInt(id) } });
    if (!item) {
      const err = new Error("Farm category not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createFarmCategory(data) {
    return prisma.farmCategory.create({ data });
  }

  static async updateFarmCategory(id, data) {
    await this.getFarmCategoryById(id);
    return prisma.farmCategory.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  static async deleteFarmCategory(id) {
    await this.getFarmCategoryById(id);
    return prisma.farmCategory.delete({ where: { id: BigInt(id) } });
  }

  // ==================== FARM SCALES ====================
  static async getFarmScales() {
    return prisma.farmScale.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { farms: true } } },
    });
  }

  static async getFarmScaleById(id) {
    const item = await prisma.farmScale.findUnique({ where: { id: BigInt(id) } });
    if (!item) {
      const err = new Error("Farm scale not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createFarmScale(data) {
    return prisma.farmScale.create({ data });
  }

  static async updateFarmScale(id, data) {
    await this.getFarmScaleById(id);
    return prisma.farmScale.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  static async deleteFarmScale(id) {
    await this.getFarmScaleById(id);
    return prisma.farmScale.delete({ where: { id: BigInt(id) } });
  }

  // ==================== LIVESTOCK CATEGORIES ====================
  static async getLivestockCategories() {
    return prisma.livestockCategory.findMany({
      orderBy: { id: "asc" },
      include: {
        livestock_types: {
          include: { livestock_subtypes: true },
        },
        _count: { select: { livestock: true } },
      },
    });
  }

  static async getLivestockCategoryById(id) {
    const item = await prisma.livestockCategory.findUnique({
      where: { id: BigInt(id) },
      include: { livestock_types: true },
    });
    if (!item) {
      const err = new Error("Livestock category not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createLivestockCategory(data) {
    return prisma.livestockCategory.create({ data });
  }

  static async updateLivestockCategory(id, data) {
    await this.getLivestockCategoryById(id);
    return prisma.livestockCategory.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  static async deleteLivestockCategory(id) {
    await this.getLivestockCategoryById(id);
    return prisma.livestockCategory.delete({ where: { id: BigInt(id) } });
  }

  // ==================== LIVESTOCK TYPES ====================
  static async getLivestockTypes(categoryId = null) {
    const where = categoryId ? { category_id: BigInt(categoryId) } : {};
    return prisma.livestockType.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        category: true,
        livestock_subtypes: true,
        _count: { select: { livestock: true } },
      },
    });
  }

  static async getLivestockTypeById(id) {
    const item = await prisma.livestockType.findUnique({
      where: { id: BigInt(id) },
      include: { category: true, livestock_subtypes: true },
    });
    if (!item) {
      const err = new Error("Livestock type not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createLivestockType(data) {
    // Validate parent category exists
    await this.getLivestockCategoryById(data.category_id);
    return prisma.livestockType.create({
      data: {
        category_id: BigInt(data.category_id),
        name: data.name,
        description: data.description,
      },
    });
  }

  static async updateLivestockType(id, data) {
    await this.getLivestockTypeById(id);
    if (data.category_id) {
      await this.getLivestockCategoryById(data.category_id);
    }
    return prisma.livestockType.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.category_id && { category_id: BigInt(data.category_id) }),
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  static async deleteLivestockType(id) {
    await this.getLivestockTypeById(id);
    return prisma.livestockType.delete({ where: { id: BigInt(id) } });
  }

  // ==================== LIVESTOCK SUBTYPES ====================
  static async getLivestockSubtypes(typeId = null) {
    const where = typeId ? { livestock_type_id: BigInt(typeId) } : {};
    return prisma.livestockSubtype.findMany({
      where,
      orderBy: { id: "asc" },
      include: { livestock_type: { include: { category: true } } },
    });
  }

  static async getLivestockSubtypeById(id) {
    const item = await prisma.livestockSubtype.findUnique({
      where: { id: BigInt(id) },
      include: { livestock_type: true },
    });
    if (!item) {
      const err = new Error("Livestock subtype not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createLivestockSubtype(data) {
    // Validate parent type exists
    await this.getLivestockTypeById(data.livestock_type_id);
    return prisma.livestockSubtype.create({
      data: {
        livestock_type_id: BigInt(data.livestock_type_id),
        name: data.name,
        description: data.description,
      },
    });
  }

  static async updateLivestockSubtype(id, data) {
    await this.getLivestockSubtypeById(id);
    if (data.livestock_type_id) {
      await this.getLivestockTypeById(data.livestock_type_id);
    }
    return prisma.livestockSubtype.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.livestock_type_id && { livestock_type_id: BigInt(data.livestock_type_id) }),
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  static async deleteLivestockSubtype(id) {
    await this.getLivestockSubtypeById(id);
    return prisma.livestockSubtype.delete({ where: { id: BigInt(id) } });
  }
}

export default MasterDataService;
