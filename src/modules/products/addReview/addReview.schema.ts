import { z } from "@hono/zod-openapi";
import { ReviewSchema } from "@/modules/shared/schemas/product";

export const AddReviewParamSchema = z.object({
	id: z.string().uuid(),
});

export const AddReviewBodySchema = z.object({
	rating: z.number().int().min(1).max(5),
	title: z.string().min(3),
	content: z.string().min(10),
});

export { ReviewSchema as AddReviewResponseSchema };
