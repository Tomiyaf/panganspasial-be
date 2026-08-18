import { z } from "zod";

export const getFarmsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    district_id: z.string().optional(),
    village_id: z.string().optional(),
    farm_category_id: z.string().optional(),
    farm_scale_id: z.string().optional(),
    livestock_type_id: z.string().optional(),
  }),
});

export const createFarmSchema = z.object({
  body: z.object({
    farm_name: z.string().min(1, "Farm name is required").max(150),
    owner_name: z.string().max(150).optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    notes: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    farm_category_id: z.union([z.string(), z.number()]).optional().nullable(),
    farm_scale_id: z.union([z.string(), z.number()]).optional().nullable(),
    district_id: z.union([z.string(), z.number()]).optional().nullable(),
    village_id: z.union([z.string(), z.number()]).optional().nullable(),
  }),
});

export const updateFarmSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    farm_name: z.string().min(1).max(150).optional(),
    owner_name: z.string().max(150).optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    notes: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    farm_category_id: z.union([z.string(), z.number()]).optional().nullable(),
    farm_scale_id: z.union([z.string(), z.number()]).optional().nullable(),
    district_id: z.union([z.string(), z.number()]).optional().nullable(),
    village_id: z.union([z.string(), z.number()]).optional().nullable(),
  }),
});
