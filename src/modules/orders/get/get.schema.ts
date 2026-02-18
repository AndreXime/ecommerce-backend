import { z } from "@hono/zod-openapi";

export const OrderGetParamSchema = z.object({
	id: z.string().uuid(),
});
