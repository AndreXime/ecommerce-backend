import { database } from "@/database/database";
import { getCart } from "../get/get.service";

export async function removeCartItem(userId: string, productId: string) {
	const cart = await database.cart.findUniqueOrThrow({ where: { userId } });

	await Promise.all([
		database.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } }),
		database.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } }),
	]);

	return getCart(userId);
}
