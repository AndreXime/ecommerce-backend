import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { getCart } from "../get/get.service";
import { buildVariantSignature, normalizeSelectedVariant } from "../shared/variantSignature";
import type { CartAddItemBodySchema } from "./addItem.schema";

type Body = z.infer<typeof CartAddItemBodySchema>;

export async function addCartItem(userId: string, body: Body) {
	const cart = await database.cart.upsert({
		where: { userId },
		create: { userId },
		update: {},
	});
	const variantSignature = buildVariantSignature(body.selectedVariant);

	const existing = await database.cartItem.findUnique({
		where: {
			cartId_productId_variantSignature: {
				cartId: cart.id,
				productId: body.productId,
				variantSignature,
			},
		},
	});

	await Promise.all([
		existing
			? database.cartItem.update({
					where: { id: existing.id },
					data: { quantity: existing.quantity + body.quantity },
				})
			: database.cartItem.create({
					data: {
						cartId: cart.id,
						productId: body.productId,
						quantity: body.quantity,
						selectedVariant: normalizeSelectedVariant(body.selectedVariant),
						variantSignature,
					},
				}),
		// Atualiza updatedAt e reseta o flag de lembrete para redetectar abandono futuro
		database.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } }),
	]);

	return getCart(userId);
}
