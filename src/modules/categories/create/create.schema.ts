import { z } from "@hono/zod-openapi";
import { CategorySchema } from "@/modules/shared/schemas/product";

export const CategoryCreateBodySchema = z.object({
	name: z.string().min(2),
});

export { CategorySchema as CategoryCreateResponseSchema };
