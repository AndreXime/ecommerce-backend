import { randomUUID } from "node:crypto";
import { database } from "@/database/database";
import { sendForgotPasswordEmail } from "@/lib/email";
import environment from "@/lib/environment";
import { hashToken } from "@/modules/auth/shared/hash";

const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora

export async function requestPasswordReset(email: string) {
	const user = await database.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true },
	});

	// Resposta genérica independente de o email existir — evita user enumeration
	if (!user) return;
	const rawToken = randomUUID();
	const hashedToken = hashToken(rawToken);
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

	await database.$transaction(async (tx) => {
		await tx.passwordResetToken.deleteMany({
			where: { userId: user.id, usedAt: null },
		});

		await tx.passwordResetToken.create({
			data: {
				userId: user.id,
				token: hashedToken,
				expiresAt,
			},
		});
	});

	const resetLink = `${environment.FRONTEND_URL}/reset-password?token=${rawToken}`;
	sendForgotPasswordEmail(user, resetLink);
}
