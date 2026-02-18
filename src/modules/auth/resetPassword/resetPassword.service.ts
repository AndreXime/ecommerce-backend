import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { hashPassword, hashToken } from "@/modules/auth/shared/hash";

export async function resetPassword(rawToken: string, newPassword: string) {
	const hashedToken = hashToken(rawToken);

	const record = await database.passwordResetToken.findUnique({
		where: { token: hashedToken },
	});

	if (!record || record.usedAt || record.expiresAt < new Date()) {
		throw new HTTPException(400, { message: "Token inválido ou expirado." });
	}

	const newHash = await hashPassword(newPassword);

	await database.$transaction([
		database.user.update({
			where: { id: record.userId },
			data: { password: newHash },
		}),
		database.passwordResetToken.update({
			where: { id: record.id },
			data: { usedAt: new Date() },
		}),
		// Revoga todos os refresh tokens ativos para forçar novo login
		database.refreshToken.updateMany({
			where: { userId: record.userId, revoked: false },
			data: { revoked: true },
		}),
	]);
}
