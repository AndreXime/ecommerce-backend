import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { OrderSchema } from "@/modules/shared/schemas/order";
import { OrderGetParamSchema } from "./get.schema";

export const OrderGetRoute = createRoute({
	method: "get",
	path: "/:id",
	tags: ["Orders"],
	summary: "Detalhes do pedido",
	description:
		"Retorna os detalhes completos de um pedido. Usuários autenticados só podem acessar seus próprios pedidos; admins podem acessar qualquer pedido.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: OrderGetParamSchema,
	},
	responses: {
		200: {
			description: "Pedido encontrado",
			content: { "application/json": { schema: OrderSchema } },
		},
		401: { description: "Não autenticado" },
		404: { description: "Pedido não encontrado" },
	},
});
