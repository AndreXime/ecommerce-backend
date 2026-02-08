import { createRoute, z } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";

// Schema de resposta do usuário
const UserProfileSchema = z.object({
	id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
	name: z.string().openapi({ example: "André Ximenes" }),
	email: z.string().email().openapi({ example: "andre@exemplo.com" }),
	createdAt: z.string().datetime().openapi({ example: "2026-02-01T10:00:00Z" }),
	updatedAt: z.string().datetime().openapi({ example: "2026-02-05T15:30:00Z" }),
});

export const MeRoute = createRoute({
	method: "get",
	path: "/me",
	tags: ["User"],
	summary: "Obter perfil atual",
	description: "Retorna os dados do usuário autenticado baseado no token enviado.",
	security: [
		{
			Bearer: [],
		},
	],
	middleware: [auth([])],
	responses: {
		200: {
			description: "Perfil do usuário",
			content: {
				"application/json": {
					schema: UserProfileSchema,
				},
			},
		},
		401: {
			description: "Não autorizado",
		},
	},
});
