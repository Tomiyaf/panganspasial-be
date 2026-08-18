import prisma from "../lib/prisma.js";

export class ValidationService {
  static async getValidations({ entity_type = null, status = null, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (entity_type) where.entity_type = entity_type;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.dataValidation.count({ where }),
      prisma.dataValidation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: "desc" },
        include: {
          validator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getValidationById(id) {
    const item = await prisma.dataValidation.findUnique({
      where: { id: BigInt(id) },
      include: {
        validator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!item) {
      const err = new Error("Validation record not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createValidation(userId, { entity_type, entity_id, status, notes = "" }) {
    const validStatuses = ["pending", "valid", "rejected"];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid validation status. Allowed statuses: ${validStatuses.join(", ")}`);
      err.status = 400;
      throw err;
    }

    return prisma.dataValidation.create({
      data: {
        entity_type,
        entity_id: BigInt(entity_id),
        status,
        notes,
        validated_by: userId ? BigInt(userId) : null,
        validated_at: new Date(),
      },
      include: {
        validator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async updateValidation(id, userId, { status, notes }) {
    await this.getValidationById(id);

    return prisma.dataValidation.update({
      where: { id: BigInt(id) },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        validated_by: userId ? BigInt(userId) : null,
        validated_at: new Date(),
      },
      include: {
        validator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}

export default ValidationService;
