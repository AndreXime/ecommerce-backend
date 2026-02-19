import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { AddressAddBodySchema, AddressAddResponseSchema } from "./add.schema";

export const AddressAddRoute = createRoute({
	method: "post",
	path: "/me/addresses",
	tags: ["User"],
	summary: "Adicionar endereço",
	description: "Adiciona um novo endereço de entrega ao perfil do usuário autenticado.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: { content: { "application/json": { schema: AddressAddBodySchema } } },
	},
	responses: {
		201: {
			description: "Endereço adicionado",
			content: { "application/json": { schema: AddressAddResponseSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
