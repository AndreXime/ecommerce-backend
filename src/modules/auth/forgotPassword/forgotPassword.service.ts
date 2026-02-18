import { randomUUID } from "node:crypto";
import { database } from "@/database/database";
import environment from "@/lib/environment";
import { sendForgotPasswordEmail } from "@/lib/queue";
import { hashToken } from "@/modules/auth/shared/hash";

const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora

export async function requestPasswordReset(email: string) {
	const user = await database.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true },
	});

	// Resposta genérica independente de o email existir — evita user enumeration
	if (!user) return;

	// Invalida tokens anteriores pendentes do mesmo usuário
	await database.passwordResetToken.deleteMany({
		where: { userId: user.id, usedAt: null },
	});

	const rawToken = randomUUID();
	const hashedToken = hashToken(rawToken);

	await database.passwordResetToken.create({
		data: {
			userId: user.id,
			token: hashedToken,
			expiresAt: new Date(Date.now() + TOKEN_EXPIRATION_MS),
		},
	});

	const resetLink = `${environment.FRONTEND_URL}/reset-password?token=${rawToken}`;
	sendForgotPasswordEmail(user, resetLink);
}
