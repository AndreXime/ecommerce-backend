import { z } from "@hono/zod-openapi";

export const ProductRemoveParamSchema = z.object({
	id: z.string().uuid(),
});
