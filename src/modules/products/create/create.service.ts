import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { toProductDetails } from "@/modules/shared/utils/productMapper";
import type { ProductCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof ProductCreateBodySchema>;

export async function createProduct(body: Body) {
	const { options, specs, stockQuantity, ...data } = body;

	const product = await database.product.create({
		data: {
			...data,
			stockQuantity,
			inStock: stockQuantity > 0,
			// Cast necessário: Prisma representa Json como Record<string, unknown> internamente
			specs: (specs ?? {}) as Record<string, string>,
			options: options ? { create: options } : undefined,
		},
		include: { category: true, images: true, options: true, reviews: true },
	});

	return toProductDetails(product);
}
