import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { ProductRemoveParamSchema } from "./remove.schema";

export const ProductRemoveRoute = createRoute({
	method: "delete",
	path: "/:id",
	tags: ["Products"],
	summary: "Remover produto",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: ProductRemoveParamSchema,
	},
	responses: {
		204: { description: "Produto removido com sucesso" },
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Produto não encontrado" },
	},
});
