import type { MiddlewareHandler } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { AppBindings, JWT } from "@/@types/declarations";
import type { Roles } from "@/database/client/enums";
import environment from "@/lib/environment";
import blocklist from "@/modules/auth/shared/blocklist";

export default function auth(requiredRoles: Roles[]): MiddlewareHandler<AppBindings> {
	return async (ctx, next) => {
		const authHeader = ctx.req.header("Authorization") || ctx.req.header("authorization");
		let token: string | undefined;

		if (authHeader?.startsWith("Bearer ")) {
			token = authHeader.split(" ")[1];
		}

		if (!token) {
			token = getCookie(ctx, "accessToken");
		}

		if (!token) {
			return ctx.json({ message: "Usuario não autenticado" }, 401);
		}

		try {
			const userPayload = (await verify(token, environment.JWT_SECRET, "HS256")) as JWT;

			if (!userPayload) {
				return ctx.json({ message: "Token invalido ou expirado" }, 401);
			}

			if (requiredRoles.length > 0 && !requiredRoles.includes(userPayload.role)) {
				return ctx.json({ message: "Acesso negado: Permissão insuficiente." }, 403);
			}

			if (userPayload.jti) {
				const isBlocked = await blocklist.isBlocked(userPayload.jti);
				if (isBlocked) {
					deleteCookie(ctx, "accessToken");
					return ctx.json({ message: "Token revogado. Faça login novamente." }, 401);
				}
			}

			ctx.set("user", userPayload);

			return await next();
		} catch {
			return ctx.json({ message: "Token invalido ou expirado" }, 401);
		}
	};
}
