import { z } from "zod";

export const createNameDescSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional().nullable(),
  }),
});

export const updateNameDescSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
  }),
});

export const createLivestockTypeSchema = z.object({
  body: z.object({
    category_id: z.union([z.string(), z.number()]),
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional().nullable(),
  }),
});

export const updateLivestockTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    category_id: z.union([z.string(), z.number()]).optional(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
  }),
});

export const createLivestockSubtypeSchema = z.object({
  body: z.object({
    livestock_type_id: z.union([z.string(), z.number()]),
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional().nullable(),
  }),
});

export const updateLivestockSubtypeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    livestock_type_id: z.union([z.string(), z.number()]).optional(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
  }),
});
