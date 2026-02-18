import { verify } from "hono/jwt";
import type { JWT } from "@/@types/declarations";
import { database } from "@/database/database";
import environment from "@/lib/environment";
import blocklist from "../shared/blocklist";
import { hashToken } from "../shared/hash";

export async function invalidateSession(accessToken?: string, refreshToken?: string) {
	if (accessToken) {
		try {
			const payload = (await verify(accessToken, environment.JWT_SECRET, "HS256")) as JWT;
			if (payload.jti && payload.exp) {
				await blocklist.add(payload.jti, payload.exp);
			}
		} catch {}
	}

	if (refreshToken) {
		try {
			const hashedToken = hashToken(refreshToken);
			await database.refreshToken.delete({ where: { hashedToken } });
		} catch {}
	}
}
