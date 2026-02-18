import { z } from "@hono/zod-openapi";

export const OrderUpdateStatusParamSchema = z.object({
	id: z.string().uuid(),
});

export const OrderUpdateStatusBodySchema = z.object({
	status: z.enum(["delivered", "intransit", "cancelled"]),
});
