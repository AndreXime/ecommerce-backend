import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CartSchema } from "@/modules/shared/schemas/cart";
import { CartRemoveItemParamSchema } from "./removeItem.schema";

export const CartRemoveItemRoute = createRoute({
	method: "delete",
	path: "/items/:productId",
	tags: ["Cart"],
	summary: "Remover item do carrinho",
	description: "Remove um produto do carrinho pelo ID do produto.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: CartRemoveItemParamSchema,
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
