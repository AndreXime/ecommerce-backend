import { database } from "@/database/database";
import redis from "@/lib/redis";

export async function checkDependencies() {
	const [dbOk, redisOk] = await Promise.all([
		database.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
		redis.client
			.ping()
			.then(() => true)
			.catch(() => false),
	]);

	return {
		status: dbOk && redisOk ? ("ok" as const) : ("degraded" as const),
		services: {
			database: dbOk ? ("up" as const) : ("down" as const),
			redis: redisOk ? ("up" as const) : ("down" as const),
		},
	};
}
