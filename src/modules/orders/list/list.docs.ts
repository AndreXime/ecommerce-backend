import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { OrderListQuerySchema, OrderListResponseSchema } from "./list.schema";

export const OrderListRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Orders"],
	summary: "Listar pedidos",
	description: "Usuários veem apenas seus pedidos. Admins veem todos.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		query: OrderListQuerySchema,
	},
	responses: {
		200: {
			description: "Lista de pedidos",
			content: { "application/json": { schema: OrderListResponseSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
