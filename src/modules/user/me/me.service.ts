import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";
import { toProductSummary } from "@/modules/shared/utils/productMapper";

export async function getUserProfile(userId: string) {
	const user = await database.user.findUnique({
		where: { id: userId },
		include: {
			addresses: true,
			paymentCards: true,
			orders: {
				include: { items: true },
				orderBy: { createdAt: "desc" },
				take: 50,
			},
			wishlistItems: {
				include: {
					product: { include: { category: true, images: true } },
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!user) return null;

	return {
		personalData: {
			name: user.name,
			email: user.email,
			registration: user.registration,
			phone: user.phone,
			role: user.role,
			registredAt: user.createdAt.toISOString(),
		},
		ordersHistory: user.orders.map(toOrder),
		wishlistProducts: user.wishlistItems.map((w) => toProductSummary(w.product)),
		paymentCards: user.paymentCards.map((c) => ({
			id: c.id,
			brand: c.brand,
			last4: c.last4,
			holder: c.holder,
			expiry: c.expiry,
		})),
		addresses: user.addresses.map((a) => ({
			id: a.id,
			type: a.type,
			street: a.street,
			city: a.city,
			isDefault: a.isDefault,
		})),
	};
}
