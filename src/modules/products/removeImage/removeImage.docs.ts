import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { RemoveImageParamSchema } from "./removeImage.schema";

export const RemoveImageRoute = createRoute({
	method: "delete",
	path: "/:id/images/:imageId",
	tags: ["Products"],
	summary: "Remover imagem do produto",
	description: "Remove o registro do banco e o arquivo do S3.",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: RemoveImageParamSchema,
	},
	responses: {
		204: { description: "Imagem removida" },
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Imagem não encontrada" },
	},
});
