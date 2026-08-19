import { z } from "zod";

export const getSpatialFarmsQuerySchema = z.object({
  query: z.object({
    district_id: z.string().optional(),
    village_id: z.string().optional(),
    farm_category_id: z.string().optional(),
    farm_scale_id: z.string().optional(),
    livestock_type_id: z.string().optional(),
    search: z.string().optional(),
    bbox: z.string().optional(),
  }),
});

export const getVillagesQuerySchema = z.object({
  query: z.object({
    district_id: z.string().optional(),
  }),
});
