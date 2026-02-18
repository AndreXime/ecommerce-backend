import { z } from "@hono/zod-openapi";

export const PaginationMetaSchema = z.object({
	page: z.number().openapi({ example: 1 }),
	limit: z.number().openapi({ example: 10 }),
	total: z.number().openapi({ example: 50 }),
	totalPages: z.number().openapi({ example: 5 }),
});
