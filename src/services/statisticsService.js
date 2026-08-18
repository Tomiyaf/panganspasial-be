import prisma from "../lib/prisma.js";

export class StatisticsService {
  /**
   * Overview KPI statistics (TASK-041)
   */
  static async getOverviewKPI({ district_id = null, farm_category_id = null, farm_scale_id = null } = {}) {
    const whereFarm = {};
    if (district_id) whereFarm.district_id = BigInt(district_id);
    if (farm_category_id) whereFarm.farm_category_id = BigInt(farm_category_id);
    if (farm_scale_id) whereFarm.farm_scale_id = BigInt(farm_scale_id);

    const [totalFarms, totalDistricts, totalTypes, livestockAgg] = await Promise.all([
      prisma.farm.count({ where: whereFarm }),
      prisma.district.count(),
      prisma.livestockType.count(),
      prisma.livestock.aggregate({
        _sum: { population: true },
        where: {
          farm: whereFarm,
        },
      }),
    ]);

    const totalPopulation = livestockAgg._sum.population || 0;

    // Distribution by Farm Category
    const categoryDistribution = await prisma.farmCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { farms: { where: whereFarm } },
        },
      },
    });

    // Distribution by Farm Scale
    const scaleDistribution = await prisma.farmScale.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { farms: { where: whereFarm } },
        },
      },
    });

    return {
      kpi: {
        total_farms: totalFarms,
        total_livestock_population: totalPopulation,
        total_districts: totalDistricts,
        total_livestock_types: totalTypes,
      },
      category_distribution: categoryDistribution.map((c) => ({
        id: c.id,
        category: c.name,
        count: c._count.farms,
      })),
      scale_distribution: scaleDistribution.map((s) => ({
        id: s.id,
        scale: s.name,
        count: s._count.farms,
      })),
    };
  }

  /**
   * Farm statistics grouped by district (TASK-042)
   */
  static async getFarmsByDistrict() {
    const districts = await prisma.district.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { farms: true, villages: true } },
        farms: {
          select: {
            livestock: {
              select: { population: true },
            },
          },
        },
      },
    });

    return districts.map((d) => {
      const population = d.farms.reduce(
        (total, f) => total + f.livestock.reduce((fTotal, l) => fTotal + (l.population || 0), 0),
        0
      );

      return {
        district_id: d.id,
        district_name: d.name,
        district_code: d.code,
        farm_count: d._count.farms,
        village_count: d._count.villages,
        total_population: population,
      };
    });
  }

  /**
   * Livestock statistics grouped by livestock type (TASK-043)
   */
  static async getLivestockStats({ district_id = null } = {}) {
    const whereLivestock = district_id
      ? { farm: { district_id: BigInt(district_id) } }
      : {};

    const types = await prisma.livestockType.findMany({
      orderBy: { name: "asc" },
      include: {
        category: true,
        livestock: {
          where: whereLivestock,
          select: { population: true, farm_id: true },
        },
      },
    });

    return types.map((t) => {
      const population = t.livestock.reduce((sum, l) => sum + (l.population || 0), 0);
      const uniqueFarms = new Set(t.livestock.map((l) => l.farm_id.toString())).size;

      return {
        type_id: t.id,
        type_name: t.name,
        category_name: t.category.name,
        total_population: population,
        farm_count: uniqueFarms,
      };
    });
  }
}

export default StatisticsService;
