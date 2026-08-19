import { z } from "zod";

export const createValidationSchema = z.object({
  body: z.object({
    entity_type: z.string().min(1, "Entity type is required"),
    entity_id: z.union([z.string(), z.number()]),
    status: z.enum(["pending", "valid", "rejected"]),
    notes: z.string().optional().nullable(),
  }),
});

export const updateValidationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(["pending", "valid", "rejected"]).optional(),
    notes: z.string().optional().nullable(),
  }),
});
