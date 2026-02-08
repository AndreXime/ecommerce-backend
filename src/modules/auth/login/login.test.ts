import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { database } from "@/database/database";
import app from "@/index";
import { hashPassword } from "@/modules/auth/shared/hash";

describe("POST /auth/login", () => {
	const email = `login_test_${Date.now()}@example.com`;
	const password = "password123";

	// Cria um utilizador diretamente no banco para testar o login
	beforeAll(async () => {
		const hashedPassword = await hashPassword(password);
		await database.user.create({
			data: {
				name: "Login Tester",
				email,
				password: hashedPassword,
			},
		});
	});

	afterAll(async () => {
		await database.user.delete({ where: { email } });
	});

	test("Deve fazer login com credenciais corretas (200)", async () => {
		const res = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		expect(res.status).toBe(200);
		const headers = res.headers.get("set-cookie");
		expect(headers).toBeTruthy();
		expect(headers).toContain("accessToken");
		expect(headers).toContain("refreshToken");
	});

	test("Deve rejeitar senha incorreta (401)", async () => {
		const res = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: "wrong_password" }),
		});

		expect(res.status).toBe(401);
	});

	test("Deve rejeitar utilizador inexistente (404)", async () => {
		const res = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "ghost@example.com", password }),
		});

		expect(res.status).toBe(404);
	});
});
