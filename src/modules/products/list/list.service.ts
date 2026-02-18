import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { getPaginationArgs } from "@/modules/shared/utils/generatePaginationQuery";
import { toProductSummary } from "@/modules/shared/utils/productMapper";
import type { ProductListQuerySchema } from "./list.schema";

type Query = z.infer<typeof ProductListQuerySchema>;

export async function listProducts(query: Query) {
	const { page, limit, sortBy, sortOrder, search, category, minPrice, maxPrice, inStock } = query;

	const { skip, take, orderBy } = getPaginationArgs({ page, limit, sortBy, sortOrder, search }, []);

	const where = {
		...(search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ tag: { contains: search, mode: "insensitive" as const } },
					],
				}
			: {}),
		...(category ? { category: { name: { equals: category, mode: "insensitive" as const } } } : {}),
		...(minPrice !== undefined || maxPrice !== undefined
			? {
					price: {
						...(minPrice !== undefined ? { gte: minPrice } : {}),
						...(maxPrice !== undefined ? { lte: maxPrice } : {}),
					},
				}
			: {}),
		...(inStock !== undefined ? { inStock } : {}),
	};

	const [products, total] = await Promise.all([
		database.product.findMany({
			skip,
			take,
			orderBy,
			where,
			include: { category: true, images: true },
		}),
		database.product.count({ where }),
	]);

	return {
		data: products.map(toProductSummary),
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}
