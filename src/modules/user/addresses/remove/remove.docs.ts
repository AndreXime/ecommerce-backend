import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { AddressRemoveParamSchema } from "./remove.schema";

export const AddressRemoveRoute = createRoute({
	method: "delete",
	path: "/me/addresses/:addressId",
	tags: ["User"],
	summary: "Remover endereço",
	description: "Remove permanentemente um endereço do perfil do usuário autenticado.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: AddressRemoveParamSchema,
	},
	responses: {
		204: { description: "Endereço removido" },
		401: { description: "Não autenticado" },
		404: { description: "Endereço não encontrado" },
	},
});
