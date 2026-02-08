import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { Roles } from "@/database/client/enums";
import { database } from "@/database/database";
import environment from "@/lib/environment";
import { hashToken } from "@/modules/auth/shared/hash";

export async function generateAuthTokens(userId: string, email: string, name: string, role: Roles) {
	const now = Math.floor(Date.now() / 1000);
	const jti = crypto.randomUUID();

	const accessToken = await sign(
		{
			id: userId,
			email,
			name,
			jti,
			role,
			type: "access",
			iat: now,
			exp: now + environment.JWT_ACCESS_EXPIRATION,
		},
		environment.JWT_SECRET,
		"HS256",
	);

	const refreshTokenRaw = crypto.randomUUID();

	await database.refreshToken.create({
		data: {
			userId,
			hashedToken: hashToken(refreshTokenRaw),
			expiresAt: new Date(Date.now() + environment.JWT_REFRESH_EXPIRATION * 1000),
		},
	});

	return { accessToken, refreshToken: refreshTokenRaw };
}

export function setAuthCookies(ctx: Context, accessToken: string, refreshToken: string) {
	const isProd = environment.ENV === "PROD";

	setCookie(ctx, "accessToken", accessToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: "Strict",
		path: "/",
		maxAge: environment.JWT_ACCESS_EXPIRATION,
	});

	setCookie(ctx, "refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: "Strict",
		path: "/auth", // Só é enviado para rotas de autenticação
		maxAge: environment.JWT_REFRESH_EXPIRATION,
	});
}
