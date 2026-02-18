import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { UploadImageBodySchema, UploadImageParamSchema, UploadImageResponseSchema } from "./uploadImage.schema";

export const UploadImageRoute = createRoute({
	method: "post",
	path: "/:id/images",
	tags: ["Products"],
	summary: "Gerar URL de upload de imagem",
	description:
		"Cria o registro da imagem no banco com a URL pública final e retorna uma URL pré-assinada para o cliente fazer o upload diretamente no S3 via PUT.",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: UploadImageParamSchema,
		body: { content: { "application/json": { schema: UploadImageBodySchema } } },
	},
	responses: {
		201: {
			description: "URL de upload gerada com sucesso",
			content: { "application/json": { schema: UploadImageResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Produto não encontrado" },
	},
});
