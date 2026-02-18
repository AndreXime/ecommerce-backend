import { z } from "@hono/zod-openapi";
import { CategorySchema } from "@/modules/shared/schemas/product";

export const CategoryListResponseSchema = z.array(CategorySchema);
