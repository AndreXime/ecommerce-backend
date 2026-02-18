import { z } from "@hono/zod-openapi";

export const CartAddItemBodySchema = z.object({
	productId: z.string().uuid(),
	quantity: z.number().int().min(1).default(1),
	selectedVariant: z.record(z.string(), z.string()).optional(),
});
