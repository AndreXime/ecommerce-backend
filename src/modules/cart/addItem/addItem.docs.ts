import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CartSchema } from "@/modules/shared/schemas/cart";
import { CartAddItemBodySchema } from "./addItem.schema";

export const CartAddItemRoute = createRoute({
	method: "post",
	path: "/items",
	tags: ["Cart"],
	summary: "Adicionar item ao carrinho",
	description:
		"Adiciona um produto ao carrinho. Se o produto já existir, a quantidade é acumulada. O carrinho é criado automaticamente caso não exista.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: { content: { "application/json": { schema: CartAddItemBodySchema } } },
	},
	responses: {
		200: {
			description: "Carrinho atualizado",
			content: { "application/json": { schema: CartSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
