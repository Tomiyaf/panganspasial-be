import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

export class UserService {
  static async getUsers() {
    return prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        role: { select: { id: true, name: true } },
        created_at: true,
        updated_at: true,
      },
    });
  }

  static async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        role: { select: { id: true, name: true } },
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async createUser({ name, email, password, role_id }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const err = new Error("Email is already registered");
      err.status = 409;
      throw err;
    }

    const defaultRole = role_id
      ? { id: BigInt(role_id) }
      : await prisma.role.findFirst({ where: { name: "Admin" } });

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: defaultRole.id,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        role: true,
        created_at: true,
      },
    });
  }

  static async updateUser(id, { name, email, password, is_active, role_id }) {
    await this.getUserById(id);

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(is_active !== undefined && { is_active }),
      ...(role_id && { role_id: BigInt(role_id) }),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return prisma.user.update({
      where: { id: BigInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        role: true,
        updated_at: true,
      },
    });
  }

  static async deleteUser(id) {
    await this.getUserById(id);
    return prisma.user.delete({ where: { id: BigInt(id) } });
  }

  /**
   * Admin Dashboard Summary (TASK-053)
   */
  static async getDashboardSummary() {
    const [
      totalFarms,
      totalLivestock,
      validationsPending,
      validationsValid,
      recentFarms,
    ] = await Promise.all([
      prisma.farm.count(),
      prisma.livestock.aggregate({ _sum: { population: true } }),
      prisma.dataValidation.count({ where: { status: "pending" } }),
      prisma.dataValidation.count({ where: { status: "valid" } }),
      prisma.farm.findMany({
        take: 5,
        orderBy: { updated_at: "desc" },
        include: { farm_category: true, district: true },
      }),
    ]);

    return {
      total_farms: totalFarms,
      total_livestock_population: totalLivestock._sum.population || 0,
      validations: {
        pending: validationsPending,
        valid: validationsValid,
      },
      recent_updates: recentFarms.map((f) => ({
        id: f.id,
        farm_name: f.farm_name,
        category: f.farm_category?.name,
        district: f.district?.name,
        updated_at: f.updated_at,
      })),
    };
  }
}

export default UserService;
