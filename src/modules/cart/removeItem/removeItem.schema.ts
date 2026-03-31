import { z } from "@hono/zod-openapi";

export const CartRemoveItemParamSchema = z.object({
	cartItemId: z.string().uuid(),
});
