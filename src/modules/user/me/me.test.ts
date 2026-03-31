import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { database } from "@/database/database";
import app from "@/index";
import environment from "@/lib/environment";
import { hashPassword } from "@/modules/auth/shared/hash";

describe("GET /users/me", () => {
	const email = `me_test_${Date.now()}@example.com`;
	let validToken = "";

	beforeAll(async () => {
		// Criar utilizador
		const user = await database.user.create({
			data: {
				name: "Me User",
				email,
				password: await hashPassword("123456"),
			},
		});
		// Gerar token manualmente para evitar depender do endpoint de login neste teste unitário
		validToken = await sign(
			{
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				jti: crypto.randomUUID(),
				sessionVersion: user.sessionVersion,
				exp: Math.floor(Date.now() / 1000) + 60 * 5,
			},
			environment.JWT_SECRET,
		);
	});

	afterAll(async () => {
		await database.user.delete({ where: { email } });
	});

	test("Deve retornar 401 se não enviar token", async () => {
		const res = await app.request("/users/me");
		expect(res.status).toBe(401);
	});

	test("Deve retornar os dados do utilizador com token válido (200)", async () => {
		const res = await app.request("/users/me", {
			headers: {
				Authorization: `Bearer ${validToken}`,
			},
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			personalData: { email: string; name: string; role: string };
			ordersHistory: unknown[];
			wishlistProducts: unknown[];
			paymentCards: unknown[];
			addresses: unknown[];
		};
		expect(body.personalData.email).toBe(email);
		expect(body.personalData.name).toBe("Me User");
		expect(body.personalData.role).toBe("CUSTOMER");
		expect(body.ordersHistory).toBeInstanceOf(Array);
		expect(body.wishlistProducts).toBeInstanceOf(Array);
		expect(body.paymentCards).toBeInstanceOf(Array);
		expect(body.addresses).toBeInstanceOf(Array);
	});
});
