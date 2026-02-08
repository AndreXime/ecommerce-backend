import { createHash } from "node:crypto";

export async function verifyPassword(password: string, hash: string) {
	return await Bun.password.verify(password, hash, "argon2d");
}

export async function hashPassword(password: string) {
	return await Bun.password.hash(password, "argon2d");
}

// SHA256 é mais rapido para decodificar do que argon2d melhor para usar com tokens
export function hashToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}
