import { database } from "@/database/database";

export async function toggleWishlist(userId: string, productId: string) {
	const existing = await database.wishlistItem.findUnique({
		where: { userId_productId: { userId, productId } },
	});

	if (existing) {
		await database.wishlistItem.delete({ where: { id: existing.id } });
		return { wishlisted: false };
	}

	await database.wishlistItem.create({ data: { userId, productId } });
	return { wishlisted: true };
}
