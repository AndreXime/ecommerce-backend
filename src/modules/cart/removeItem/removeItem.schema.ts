import { z } from "@hono/zod-openapi";

export const CartRemoveItemParamSchema = z.object({
	productId: z.string().uuid(),
});
