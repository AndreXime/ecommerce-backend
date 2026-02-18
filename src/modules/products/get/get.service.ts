import { database } from "@/database/database";
import { toProductDetails } from "@/modules/shared/utils/productMapper";

export async function getProductById(id: string) {
	const product = await database.product.findUnique({
		where: { id },
		include: {
			category: true,
			images: true,
			options: true,
			reviews: { orderBy: { date: "desc" } },
		},
	});

	if (!product) return null;

	return toProductDetails(product);
}
