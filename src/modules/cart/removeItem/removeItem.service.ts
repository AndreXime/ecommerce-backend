import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { getCart } from "../get/get.service";

export async function removeCartItem(userId: string, cartItemId: string) {
	const cart = await database.cart.findUniqueOrThrow({ where: { userId } });
	const cartItem = await database.cartItem.findFirst({
		where: { id: cartItemId, cartId: cart.id },
	});

	if (!cartItem) {
		throw new HTTPException(404, { message: "Item não encontrado no carrinho." });
	}

	await Promise.all([
		database.cartItem.delete({ where: { id: cartItem.id } }),
		database.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } }),
	]);

	return getCart(userId);
}
