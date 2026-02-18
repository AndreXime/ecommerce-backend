import { z } from "@hono/zod-openapi";

export const RemoveImageParamSchema = z.object({
	id: z.string().uuid(),
	imageId: z.string().uuid(),
});
