import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CartSchema } from "@/modules/shared/schemas/cart";
import { CartUpdateItemBodySchema, CartUpdateItemParamSchema } from "./updateItem.schema";

export const CartUpdateItemRoute = createRoute({
	method: "patch",
	path: "/items/:productId",
	tags: ["Cart"],
	summary: "Atualizar item do carrinho",
	description: "Atualiza a quantidade e/ou variante selecionada de um item existente no carrinho.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: CartUpdateItemParamSchema,
		body: { content: { "application/json": { schema: CartUpdateItemBodySchema } } },
	},
	responses: {
		200: {
			description: "Carrinho atualizado",
			content: { "application/json": { schema: CartSchema } },
		},
		401: { description: "Não autenticado" },
		404: { description: "Item não encontrado no carrinho" },
	},
});
