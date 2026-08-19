import { z } from "zod";

export const createCriterionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional().nullable(),
    criteria_type: z.enum(["benefit", "cost"]).default("benefit"),
    weight: z.number().min(0).max(1).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateCriterionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    criteria_type: z.enum(["benefit", "cost"]).optional(),
    weight: z.number().min(0).max(1).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const createWeightRuleSchema = z.object({
  params: z.object({
    criteriaId: z.string().min(1),
  }),
  body: z.object({
    category: z.string().optional().nullable(),
    min_value: z.number().optional().nullable(),
    max_value: z.number().optional().nullable(),
    score: z.number().min(0, "Score must be non-negative"),
  }),
});
