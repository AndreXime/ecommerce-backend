import { z } from "@hono/zod-openapi";
import { orderStatuses } from "../shared/status";

export const OrderUpdateStatusParamSchema = z.object({
	id: z.string().uuid(),
});

export const OrderUpdateStatusBodySchema = z.object({
	status: z.enum(orderStatuses),
});
