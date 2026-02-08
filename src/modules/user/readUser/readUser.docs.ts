import { createRoute, z } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { createPaginationSchema } from "@/modules/shared/utils/generatePaginationQuery";

const UserResponseSchema = z.object({
	id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
	name: z.string().openapi({ example: "André Ximenes" }),
	email: z.string().email().openapi({ example: "andre@exemplo.com" }),
	role: z.enum(["ADMIN", "CUSTOMER", "SUPPORT"]).openapi({ example: "CUSTOMER" }),
	createdAt: z.string().datetime().openapi({ example: "2026-02-01T10:00:00Z" }),
	updatedAt: z.string().datetime().openapi({ example: "2026-02-05T15:30:00Z" }),
});

const PaginationMetaSchema = z.object({
	page: z.number().openapi({ example: 1 }),
	limit: z.number().openapi({ example: 10 }),
	total: z.number().openapi({ example: 50 }),
	totalPages: z.number().openapi({ example: 5 }),
});

const QuerySchema = createPaginationSchema(["name", "email", "createdAt"]);

export const ReadUserRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["User"],
	summary: "Obter todos os perfis",
	description: "Retorna todos os dados de usuários com paginação.",
	request: {
		query: QuerySchema,
	},
	security: [
		{
			Bearer: [],
		},
	],
	middleware: [auth(["ADMIN"])] as const,
	responses: {
		200: {
			description: "Lista de usuários recuperada com sucesso",
			content: {
				"application/json": {
					schema: z.object({
						data: z.array(UserResponseSchema),
						meta: PaginationMetaSchema,
					}),
				},
			},
		},
		401: {
			description: "Não autenticado",
		},
		403: {
			description: "Acesso negado (Requer ADMIN)",
		},
	},
});
