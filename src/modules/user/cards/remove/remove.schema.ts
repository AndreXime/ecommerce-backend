import { z } from "@hono/zod-openapi";

export const CardRemoveParamSchema = z.object({
	cardId: z.string().uuid(),
});
