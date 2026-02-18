import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { getCart } from "../get/get.service";
import type { CartUpdateItemBodySchema } from "./updateItem.schema";

type Body = z.infer<typeof CartUpdateItemBodySchema>;

export async function updateCartItem(userId: string, productId: string, body: Body) {
	const cart = await database.cart.findUniqueOrThrow({ where: { userId } });

	await Promise.all([
		database.cartItem.update({
			where: { cartId_productId: { cartId: cart.id, productId } },
			data: {
				quantity: body.quantity,
				// Cast necessário: Prisma espera InputJsonValue mas o tipo inferido pelo spread é mais restrito
				selectedVariant: body.selectedVariant as Record<string, string> | undefined,
			},
		}),
		database.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } }),
	]);

	return getCart(userId);
}
