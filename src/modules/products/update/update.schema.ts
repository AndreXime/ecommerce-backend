import { z } from "@hono/zod-openapi";

export const ProductUpdateParamSchema = z.object({
	id: z.string().uuid(),
});

export const ProductUpdateBodySchema = z.object({
	name: z.string().min(2).optional(),
	tag: z.string().min(2).optional(),
	price: z.number().positive().optional(),
	discountPercentage: z.number().min(0).max(100).nullable().optional(),
	isNew: z.boolean().optional(),
	inStock: z.boolean().optional(),
	description: z.string().min(10).optional(),
	specs: z.record(z.string(), z.string()).optional(),
	categoryId: z.string().uuid().optional(),
});
