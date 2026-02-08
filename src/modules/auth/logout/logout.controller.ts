import { deleteCookie, getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { JWT } from "@/@types/declarations";
import environment from "@/lib/environment";
import blocklist from "../shared/blocklist";
import { hashToken } from "../shared/hash";
import { LogoutRoute } from "./logout.docs";

export const registerRoutesLogout = (server: ServerType) => {
	server.openapi(LogoutRoute, async (ctx) => {
		const token = getCookie(ctx, "accessToken") || ctx.req.header("Authorization")?.replace("Bearer ", "");

		if (token) {
			try {
				const payload = (await verify(token, environment.JWT_SECRET, "HS256")) as JWT;
				if (payload.jti && payload.exp) {
					await blocklist.add(payload.jti, payload.exp);
				}
			} catch {}
		}

		const refreshToken = getCookie(ctx, "refreshToken");
		if (refreshToken) {
			try {
				const hashedToken = hashToken(refreshToken);
				await ctx.database.refreshToken.delete({ where: { hashedToken } });
			} catch {}
		}

		deleteCookie(ctx, "accessToken", { path: "/" });
		deleteCookie(ctx, "refreshToken", { path: "/auth" });

		return ctx.json({ message: "Logout com sucesso" }, 200);
	});
};
