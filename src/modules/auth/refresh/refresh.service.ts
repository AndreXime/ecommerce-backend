import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { hashToken } from "../shared/hash";
import { generateAuthTokens } from "../shared/tokens";

export async function generateRefreshTokens(refreshTokenRaw: string) {
	const hashedToken = hashToken(refreshTokenRaw);
	const now = new Date();

	return database.$transaction(async (tx) => {
		const tokenRecord = await tx.refreshToken.findUnique({
			where: { hashedToken },
		});

		if (!tokenRecord) {
			throw new HTTPException(401, { message: "Token inválido" });
		}

		const consumeResult = await tx.refreshToken.updateMany({
			where: {
				id: tokenRecord.id,
				revoked: false,
				expiresAt: { gt: now },
			},
			data: { revoked: true },
		});

		if (consumeResult.count !== 1) {
			if (tokenRecord.revoked) {
				throw new HTTPException(401, { message: "Token revogado" });
			}

			throw new HTTPException(401, { message: "Token expirado" });
		}

		const user = await tx.user.findUnique({ where: { id: tokenRecord.userId } });

		if (!user) {
			throw new HTTPException(401, { message: "Usuário não encontrado" });
		}

		return generateAuthTokens(user.id, user.email, user.name, user.role, user.sessionVersion, tx);
	});
}
