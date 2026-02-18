import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { database } from "@/database/database";
import app from "@/index";
import { hashPassword } from "@/modules/auth/shared/hash";

describe("POST /auth/refresh", () => {
	const email = `refresh_test_${Date.now()}@example.com`;
	let refreshTokenCookie = "";

	beforeAll(async () => {
		// 1. Criar utilizador
		const hashedPassword = await hashPassword("123456");
		await database.user.create({
			data: { name: "Refresh User", email, password: hashedPassword },
		});

		// 2. Fazer Login para obter o cookie inicial
		const loginRes = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: "123456" }),
		});

		// Extrair o cookie refreshToken do header Set-Cookie
		const cookies = loginRes.headers.get("set-cookie") || "";
		// Regex simples para pegar o valor do refreshToken
		const match = cookies.match(/refreshToken=([^;]+)/);
		if (match) {
			refreshTokenCookie = `refreshToken=${match[1]}`;
		}
	});

	afterAll(async () => {
		await database.user.delete({ where: { email } });
	});

	test("Deve renovar o token com um cookie válido (200)", async () => {
		const res = await app.request("/auth/refresh", {
			method: "POST",
			headers: {
				Cookie: refreshTokenCookie,
			},
		});

		expect(res.status).toBe(200);

		// Deve retornar novos cookies
		const newCookies = res.headers.get("set-cookie");
		expect(newCookies).toContain("accessToken");
		expect(newCookies).toContain("refreshToken");
	});

	test("Deve falhar sem o cookie de refresh (401)", async () => {
		const res = await app.request("/auth/refresh", {
			method: "POST",
		});

		expect(res.status).toBe(401);
	});
});
