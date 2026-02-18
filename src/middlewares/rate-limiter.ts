import { rateLimiter as honoRateLimiter, RedisStore } from "hono-rate-limiter";
import type { AppBindings } from "@/@types/declarations";
import redis from "@/lib/redis";

/**
 * Adaptador para tornar o ioredis compatível com o hono-rate-limiter
 */
const redisAdapter = {
	scriptLoad: (script: string) => {
		return redis.client.script("LOAD", script) as Promise<string>;
	},
	evalsha: <TArgs extends unknown[], TData = unknown>(sha1: string, keys: string[], args: TArgs) => {
		return redis.client.evalsha(sha1, keys.length, ...keys, ...(args as (string | number)[])) as Promise<TData>;
	},
	decr: (key: string) => redis.client.decr(key),
	del: (key: string) => redis.client.del(key),
};

const rateLimiter = (limit: number, minutes: number, keyPrefix: string) => {
	return honoRateLimiter<AppBindings>({
		windowMs: minutes * 60 * 1000,
		limit: limit,
		standardHeaders: true,
		message: {
			message: "Muitas requisições. Por favor, tente novamente mais tarde.",
		},

		keyGenerator: (c) => {
			// Tenta usar o ID do utilizador se estiver autenticado
			const user = c.get("user");
			if (user) {
				return `${keyPrefix}_user_${user.id}`;
			}

			// Fallback para IP (essencial para rotas públicas como Login/Register)
			const ip = c.req.header("x-forwarded-for") || "unknown_ip";
			return `${keyPrefix}_ip_${ip}`;
		},

		store: new RedisStore({
			client: redisAdapter,
			prefix: "rate-limit:",
		}),
	});
};

export default rateLimiter;
