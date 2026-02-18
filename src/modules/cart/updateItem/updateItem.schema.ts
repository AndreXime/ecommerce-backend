import { z } from "@hono/zod-openapi";

export const CartUpdateItemParamSchema = z.object({
	productId: z.string().uuid(),
});

export const CartUpdateItemBodySchema = z.object({
	quantity: z.number().int().min(1),
	selectedVariant: z.record(z.string(), z.string()).optional(),
});
