import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { toProductDetails } from "@/modules/shared/utils/productMapper";
import type { ProductUpdateBodySchema } from "./update.schema";

type Body = z.infer<typeof ProductUpdateBodySchema>;

export async function updateProduct(id: string, body: Body) {
	const { specs, categoryId, ...rest } = body;

	const product = await database.product.update({
		where: { id },
		data: {
			...rest,
			...(categoryId ? { categoryId } : {}),
			...(specs ? { specs: specs as Record<string, string> } : {}),
		},
		include: { category: true, images: true, options: true, reviews: true },
	});

	return toProductDetails(product);
}
