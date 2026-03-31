import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { getCart } from "../get/get.service";
import { buildVariantSignature, normalizeSelectedVariant } from "../shared/variantSignature";
import type { CartUpdateItemBodySchema } from "./updateItem.schema";

type Body = z.infer<typeof CartUpdateItemBodySchema>;

export async function updateCartItem(userId: string, cartItemId: string, body: Body) {
	const cart = await database.cart.findUniqueOrThrow({ where: { userId } });
	const targetVariantSignature = buildVariantSignature(body.selectedVariant);

	await database.$transaction(async (tx) => {
		const cartItem = await tx.cartItem.findFirst({
			where: { id: cartItemId, cartId: cart.id },
		});

		if (!cartItem) {
			throw new HTTPException(404, { message: "Item não encontrado no carrinho." });
		}

		const mergeTarget = await tx.cartItem.findFirst({
			where: {
				cartId: cart.id,
				productId: cartItem.productId,
				variantSignature: targetVariantSignature,
				id: { not: cartItem.id },
			},
		});

		if (mergeTarget) {
			await tx.cartItem.update({
				where: { id: mergeTarget.id },
				data: {
					quantity: mergeTarget.quantity + body.quantity,
				},
			});

			await tx.cartItem.delete({
				where: { id: cartItem.id },
			});
		} else {
			await tx.cartItem.update({
				where: { id: cartItem.id },
				data: {
					quantity: body.quantity,
					selectedVariant: normalizeSelectedVariant(body.selectedVariant),
					variantSignature: targetVariantSignature,
				},
			});
		}

		await tx.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } });
	});

	return getCart(userId);
}
