import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { hashPassword, hashToken } from "@/modules/auth/shared/hash";

export async function resetPassword(rawToken: string, newPassword: string) {
	const hashedToken = hashToken(rawToken);
	const newHash = await hashPassword(newPassword);
	const now = new Date();

	await database.$transaction(async (tx) => {
		const record = await tx.passwordResetToken.findUnique({
			where: { token: hashedToken },
		});

		if (!record) {
			throw new HTTPException(400, { message: "Token inválido ou expirado." });
		}

		const consumeResult = await tx.passwordResetToken.updateMany({
			where: {
				id: record.id,
				usedAt: null,
				expiresAt: { gt: now },
			},
			data: { usedAt: now },
		});

		if (consumeResult.count !== 1) {
			throw new HTTPException(400, { message: "Token inválido ou expirado." });
		}

		await tx.user.update({
			where: { id: record.userId },
			data: {
				password: newHash,
				sessionVersion: { increment: 1 },
			},
		});

		await tx.refreshToken.updateMany({
			where: { userId: record.userId, revoked: false },
			data: { revoked: true },
		});
	});
}
