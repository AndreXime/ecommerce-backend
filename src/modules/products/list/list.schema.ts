import { z } from "@hono/zod-openapi";
import { PaginationMetaSchema } from "@/modules/shared/schemas/pagination";
import { ProductSummarySchema } from "@/modules/shared/schemas/product";
import { createPaginationSchema } from "@/modules/shared/utils/generatePaginationQuery";

export const ProductListQuerySchema = createPaginationSchema(["name", "price", "rating", "createdAt"]).extend({
	category: z.string().optional().openapi({ description: "Filtrar por nome de categoria" }),
	minPrice: z.coerce.number().optional().openapi({ description: "Preço mínimo" }),
	maxPrice: z.coerce.number().optional().openapi({ description: "Preço máximo" }),
	inStock: z.coerce.boolean().optional().openapi({ description: "Filtrar por disponibilidade" }),
});

export const ProductListResponseSchema = z.object({
	data: z.array(ProductSummarySchema),
	meta: PaginationMetaSchema,
});
