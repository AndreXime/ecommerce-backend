import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { toProductDetails } from "@/modules/shared/utils/productMapper";
import type { ProductCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof ProductCreateBodySchema>;

export async function createProduct(body: Body) {
	const { images, options, specs, ...data } = body;

	const product = await database.product.create({
		data: {
			...data,
			// Cast necessário: Prisma representa Json como Record<string, unknown> internamente
			specs: (specs ?? {}) as Record<string, string>,
			images: { create: images.map((img, i) => ({ url: img.url, position: img.position ?? i })) },
			options: options ? { create: options } : undefined,
		},
		include: { category: true, images: true, options: true, reviews: true },
	});

	return toProductDetails(product);
}
