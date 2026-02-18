import { z } from "@hono/zod-openapi";

export const WishlistToggleParamSchema = z.object({
	productId: z.string().uuid(),
});

export const WishlistToggleResponseSchema = z.object({
	wishlisted: z.boolean(),
});
