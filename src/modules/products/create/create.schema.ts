import { z } from "@hono/zod-openapi";

export const ProductCreateBodySchema = z.object({
	name: z.string().min(2),
	tag: z.string().min(2),
	price: z.number().positive(),
	discountPercentage: z.number().min(0).max(100).optional(),
	isNew: z.boolean().optional(),
	inStock: z.boolean().optional(),
	description: z.string().min(10),
	specs: z.record(z.string(), z.string()).optional(),
	categoryId: z.string().uuid(),
	options: z
		.array(
			z.object({
				label: z.string(),
				uiType: z.enum(["color", "pill", "select"]),
				values: z.array(z.string()).min(1),
			}),
		)
		.optional(),
});
