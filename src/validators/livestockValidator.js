import { z } from "zod";

export const createLivestockSchema = z.object({
  params: z.object({
    farmId: z.string().min(1),
  }),
  body: z.object({
    livestock_category_id: z.union([z.string(), z.number()]).optional(),
    livestock_type_id: z.union([z.string(), z.number()]),
    livestock_subtype_id: z.union([z.string(), z.number()]).optional().nullable(),
    population: z.number().int().min(0, "Population must be non-negative").default(0),
  }),
});

export const updateLivestockSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    livestock_category_id: z.union([z.string(), z.number()]).optional(),
    livestock_type_id: z.union([z.string(), z.number()]).optional(),
    livestock_subtype_id: z.union([z.string(), z.number()]).optional().nullable(),
    population: z.number().int().min(0).optional(),
  }),
});
