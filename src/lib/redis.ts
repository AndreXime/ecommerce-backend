import Redis from "ioredis";
import { log } from "./dev";
import environment from "./environment";

const REDIS_URL = environment.REDIS_URL || "redis://localhost:6379";

class RedisProvider {
	public client: Redis;

	constructor() {
		this.client = new Redis(REDIS_URL, {
			maxRetriesPerRequest: null,
			enableReadyCheck: false,
		});
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.client.ping();

			log("Conexão Redis bem-sucedida.", "success");
			return true;
		} catch (error) {
			console.error("Falha na conexão Redis:", error);
			return false;
		}
	}
}

const redis = new RedisProvider();
export default redis;
