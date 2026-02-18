import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { hashToken } from "../shared/hash";
import { generateAuthTokens } from "../shared/tokens";

export async function generateRefreshTokens(refreshTokenRaw: string) {
	const hashedToken = hashToken(refreshTokenRaw);

	const tokenRecord = await database.refreshToken.findUnique({
		where: { hashedToken },
	});

	if (!tokenRecord) {
		throw new HTTPException(401, { message: "Token inválido" });
	}

	if (tokenRecord.revoked || new Date() > tokenRecord.expiresAt) {
		throw new HTTPException(401, { message: "Token expirado ou revogado" });
	}

	// Revoga o token atual para ele não ser usado novamente
	await database.refreshToken.update({
		where: { id: tokenRecord.id },
		data: { revoked: true },
	});

	const user = await database.user.findUnique({ where: { id: tokenRecord.userId } });

	if (!user) throw new HTTPException(401, { message: "Usuário não encontrado" });

	const newTokens = await generateAuthTokens(user.id, user.email, user.name, user.role);

	return newTokens;
}
