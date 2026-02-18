import { z } from "@hono/zod-openapi";
import { ProductDetailsSchema } from "@/modules/shared/schemas/product";

export const ProductIdParamSchema = z.object({
	id: z.string().uuid().openapi({ description: "ID do produto" }),
});

export { ProductDetailsSchema as ProductGetResponseSchema };
