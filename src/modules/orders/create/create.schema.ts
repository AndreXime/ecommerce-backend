import { z } from "@hono/zod-openapi";

export const OrderCreateBodySchema = z.object({
	// Cria o pedido a partir do carrinho atual do usuário.
	// Itens opcionais para sobrescrever o carrinho (ex: compra direta).
	items: z
		.array(
			z.object({
				productId: z.string().uuid(),
				quantity: z.number().int().min(1),
				selectedVariant: z.record(z.string(), z.string()).optional(),
			}),
		)
		.optional(),
});
