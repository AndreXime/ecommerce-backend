import redis from "@/lib/redis";

const PREFIX = "blocklist:token:";

export class BlocklistService {
	// Adiciona um JTI (JWT ID) à blocklist com um tempo de expiração.
	async add(jti: string, exp: number) {
		const now = Math.floor(Date.now() / 1000);
		const ttl = exp - now;

		if (ttl > 0) {
			// Guarda no Redis apenas pelo tempo que falta para o token expirar naturalmente
			await redis.client.set(`${PREFIX}${jti}`, "revoked", "EX", ttl);
		}
	}

	// Verifica se um JTI está na blocklist.
	async isBlocked(jti: string): Promise<boolean> {
		const result = await redis.client.get(`${PREFIX}${jti}`);
		return result !== null;
	}
}

const blocklist = new BlocklistService();
export default blocklist;
