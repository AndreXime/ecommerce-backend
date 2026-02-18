import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { AddressUpdateBodySchema, AddressUpdateParamSchema, AddressUpdateResponseSchema } from "./update.schema";

export const AddressUpdateRoute = createRoute({
	method: "patch",
	path: "/me/addresses/:addressId",
	tags: ["User"],
	summary: "Atualizar endereço",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: AddressUpdateParamSchema,
		body: { content: { "application/json": { schema: AddressUpdateBodySchema } } },
	},
	responses: {
		200: {
			description: "Endereço atualizado",
			content: { "application/json": { schema: AddressUpdateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		404: { description: "Endereço não encontrado" },
	},
});
