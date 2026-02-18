import { z } from "@hono/zod-openapi";
import { ProductSummarySchema } from "./product";

export const CartItemSchema = ProductSummarySchema.extend({
	quantity: z.number().int().min(1),
	selectedVariant: z.record(z.string(), z.string()).nullable().optional(),
	cartItemId: z.string().uuid(),
});

export const CartSchema = z.object({
	id: z.string().uuid(),
	items: z.array(CartItemSchema),
});
