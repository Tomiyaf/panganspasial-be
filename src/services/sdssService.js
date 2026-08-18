import prisma from "../lib/prisma.js";

export class SdssService {
  // ==================== CRITERIA MANAGEMENT (TASK-047) ====================
  static async getCriteria() {
    return prisma.sdssCriterion.findMany({
      orderBy: { id: "asc" },
      include: { sdss_weights: true },
    });
  }

  static async getCriterionById(id) {
    const item = await prisma.sdssCriterion.findUnique({
      where: { id: BigInt(id) },
      include: { sdss_weights: true },
    });
    if (!item) {
      const err = new Error("SDSS criterion not found");
      err.status = 404;
      throw err;
    }
    return item;
  }

  static async createCriterion(data) {
    return prisma.sdssCriterion.create({
      data: {
        name: data.name,
        description: data.description,
        criteria_type: data.criteria_type || "benefit",
        weight: data.weight !== undefined ? Number(data.weight) : 0.25,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });
  }

  static async updateCriterion(id, data) {
    await this.getCriterionById(id);
    return prisma.sdssCriterion.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.criteria_type && { criteria_type: data.criteria_type }),
        ...(data.weight !== undefined && { weight: Number(data.weight) }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  }

  static async deleteCriterion(id) {
    await this.getCriterionById(id);
    return prisma.$transaction([
      prisma.sdssWeight.deleteMany({ where: { criteria_id: BigInt(id) } }),
      prisma.sdssCriterion.delete({ where: { id: BigInt(id) } }),
    ]);
  }

  // ==================== WEIGHT RULES (TASK-048) ====================
  static async createWeightRule(criteriaId, data) {
    await this.getCriterionById(criteriaId);
    return prisma.sdssWeight.create({
      data: {
        criteria_id: BigInt(criteriaId),
        category: data.category,
        min_value: data.min_value !== undefined ? Number(data.min_value) : null,
        max_value: data.max_value !== undefined ? Number(data.max_value) : null,
        score: data.score !== undefined ? Number(data.score) : null,
      },
    });
  }

  static async deleteWeightRule(id) {
    return prisma.sdssWeight.delete({ where: { id: BigInt(id) } });
  }

  // ==================== CALCULATION ENGINE & RECOMMENDATION (TASK-049, 050, 051) ====================
  /**
   * Calculate SDSS district ranking using Weighted Scoring (SAW method)
   */
  static async calculateRecommendations({ persist = false } = {}) {
    // 1. Fetch active criteria
    const criteria = await prisma.sdssCriterion.findMany({
      where: { is_active: true },
      include: { sdss_weights: true },
    });

    // 2. Fetch district statistics
    const districts = await prisma.district.findMany({
      include: {
        farms: {
          include: {
            livestock: true,
            farm_category: true,
            farm_scale: true,
          },
        },
      },
    });

    if (districts.length === 0) {
      return [];
    }

    // Extract metrics per district
    const districtMetrics = districts.map((d) => {
      const farmCount = d.farms.length;
      const totalPopulation = d.farms.reduce(
        (sum, f) => sum + f.livestock.reduce((lSum, l) => lSum + (l.population || 0), 0),
        0
      );
      const industrialFarms = d.farms.filter((f) => f.farm_category?.name === "Industri").length;
      const largeFarms = d.farms.filter((f) => f.farm_scale?.name === "Besar" || f.farm_scale?.name === "Sedang").length;

      return {
        district_id: d.id,
        district_name: d.name,
        district_code: d.code,
        farm_count: farmCount,
        total_population: totalPopulation,
        industrial_farms: industrialFarms,
        large_farms: largeFarms,
      };
    });

    // Determine max values for normalization
    const maxFarms = Math.max(...districtMetrics.map((m) => m.farm_count), 1);
    const maxPopulation = Math.max(...districtMetrics.map((m) => m.total_population), 1);
    const maxIndustrial = Math.max(...districtMetrics.map((m) => m.industrial_farms), 1);
    const maxLarge = Math.max(...districtMetrics.map((m) => m.large_farms), 1);

    // Calculate score using weights
    const scoredDistricts = districtMetrics.map((m) => {
      // Normalized values [0 - 1]
      const normFarms = m.farm_count / maxFarms;
      const normPop = m.total_population / maxPopulation;
      const normInd = m.industrial_farms / maxIndustrial;
      const normLarge = m.large_farms / maxLarge;

      // Weighted sum (default weights: Pop 35%, Farms 25%, Large 20%, Ind 20%)
      const finalScore = Number((normPop * 0.35 + normFarms * 0.25 + normLarge * 0.20 + normInd * 0.20).toFixed(4));

      let recommendation = "Cukup Potensial";
      let explanation = `Kecamatan ${m.district_name} memiliki potensi pengembangan peternakan dengan ${m.farm_count} unit peternakan dan ${m.total_population.toLocaleString()} populasi ternak.`;

      if (finalScore >= 0.70) {
        recommendation = "Sangat Potensial";
        explanation = `Kecamatan ${m.district_name} merupakan sentra utama peternakan unggulan dengan konsentrasi populasi ternak dan skala usaha tertinggi.`;
      } else if (finalScore >= 0.40) {
        recommendation = "Potensial";
        explanation = `Kecamatan ${m.district_name} memiliki potensi pengembangan yang baik dengan dukungan unit peternakan aktif.`;
      }

      return {
        district_id: m.district_id,
        district_name: m.district_name,
        district_code: m.district_code,
        score: finalScore,
        farm_count: m.farm_count,
        total_population: m.total_population,
        recommendation,
        explanation,
      };
    });

    // Sort by score descending and assign rank
    scoredDistricts.sort((a, b) => b.score - a.score);
    const rankedResults = scoredDistricts.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // Persist to sdss_results table if requested (TASK-051)
    if (persist) {
      await prisma.$transaction([
        prisma.sdssResult.deleteMany(),
        ...rankedResults.map((r) =>
          prisma.sdssResult.create({
            data: {
              district_id: r.district_id,
              score: r.score,
              rank: r.rank,
              recommendation: r.recommendation,
              explanation: r.explanation,
            },
          })
        ),
      ]);
    }

    return rankedResults;
  }
}

export default SdssService;
