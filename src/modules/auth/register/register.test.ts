import { afterAll, describe, expect, test } from "bun:test";
import { database } from "@/database/database";
import app from "@/index";

const generateEmail = () => `test_${Date.now()}@example.com`;

describe("POST /auth/register", () => {
	const userEmail = generateEmail();

	test("Deve registar um novo utilizador com sucesso (201)", async () => {
		const res = await app.request("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Test User",
				email: userEmail,
				password: "password123",
				confirmPassword: "password123",
			}),
		});

		expect(res.status).toBe(201);
		const body = (await res.json()) as { message: string };
		expect(body.message).toBe("Cadastro enviado com sucesso");

		// Verifica se os cookies foram definidos
		const setCookie = res.headers.get("set-cookie");
		expect(setCookie).toContain("accessToken");
		expect(setCookie).toContain("refreshToken");
	});

	test("Deve falhar se as senhas não coincidirem (400)", async () => {
		const res = await app.request("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Fail User",
				email: generateEmail(),
				password: "password123",
				confirmPassword: "passwordMISMATCH",
			}),
		});

		expect(res.status).toBe(400);
	});

	test("Deve falhar se o e-mail já existir (409)", async () => {
		// Tenta registar novamente o mesmo e-mail do primeiro teste
		const res = await app.request("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Duplicate User",
				email: userEmail, // Mesmo e-mail
				password: "password123",
				confirmPassword: "password123",
			}),
		});

		expect(res.status).toBe(409);
	});

	// Limpeza opcional após os testes
	afterAll(async () => {
		await database.user.deleteMany({
			where: { email: { contains: "test_" } },
		});
	});
});
