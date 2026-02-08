import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/@types/declarations";
import type { Roles } from "@/database/client/enums";
import authMiddleware from "@/middlewares/auth";
import { zodHook } from "@/middlewares/validator";

type CreateRouterOptions = {
	auth?: boolean;
	roles?: Roles[];
};

export default function createRouter(options: CreateRouterOptions = {}) {
	const app = new OpenAPIHono<AppBindings>({
		defaultHook: zodHook,
	});

	if (options.auth) {
		app.use("/*", authMiddleware(options.roles || []));
	}

	return app;
}
