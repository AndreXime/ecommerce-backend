import { database } from "@/database/database";
import { toProductSummary } from "@/modules/shared/utils/productMapper";

export async function getCart(userId: string) {
	const cart = await database.cart.upsert({
		where: { userId },
		create: { userId },
		update: {},
		include: {
			items: {
				include: {
					product: { include: { category: true, images: true } },
				},
			},
		},
	});

	return {
		id: cart.id,
		items: cart.items.map((item) => ({
			...toProductSummary(item.product),
			quantity: item.quantity,
			selectedVariant: item.selectedVariant as Record<string, string> | null,
			cartItemId: item.id,
		})),
	};
}
