import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { setAuthCookies } from "../shared/tokens";
import { RefreshRoute } from "./refresh.docs";
import { generateRefreshTokens } from "./refresh.service";

export const registerRoutesRefresh = (server: ServerType) => {
	server.openapi(RefreshRoute, async (ctx) => {
		const refreshTokenRaw = getCookie(ctx, "refreshToken");

		if (!refreshTokenRaw) {
			throw new HTTPException(401, { message: "Refresh token não fornecido" });
		}

		const { accessToken, refreshToken } = await generateRefreshTokens(refreshTokenRaw);

		setAuthCookies(ctx, accessToken, refreshToken);

		return ctx.json({ message: "Sessão renovada com sucesso" }, 200);
	});
};
