/** biome-ignore-all lint/suspicious/noExplicitAny: "" */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { database } from "@/database/database";
import app from "@/index";
import environment from "@/lib/environment";
import { hashPassword } from "@/modules/auth/shared/hash";

describe("GET /user/users", () => {
	const adminEmail = `admin_read_${Date.now()}@example.com`;
	const customerEmail = `customer_read_${Date.now()}@example.com`;
	let adminToken = "";
	let customerToken = "";

	beforeAll(async () => {
		// 1. Criar ADMIN
		const admin = await database.user.create({
			data: {
				name: "Admin User",
				email: adminEmail,
				password: await hashPassword("123456"),
				role: "ADMIN",
			},
		});

		adminToken = await sign(
			{
				id: admin.id,
				email: admin.email,
				name: admin.name,
				role: admin.role,
				exp: Math.floor(Date.now() / 1000) + 60 * 5,
			},
			environment.JWT_SECRET,
		);

		// 2. Criar CUSTOMER
		const customer = await database.user.create({
			data: {
				name: "Customer User",
				email: customerEmail,
				password: await hashPassword("123456"),
				role: "CUSTOMER",
			},
		});

		customerToken = await sign(
			{
				id: customer.id,
				email: customer.email,
				name: customer.name,
				role: customer.role,
				exp: Math.floor(Date.now() / 1000) + 60 * 5,
			},
			environment.JWT_SECRET,
		);
	});

	afterAll(async () => {
		await database.user.deleteMany({
			where: { email: { in: [adminEmail, customerEmail] } },
		});
	});

	test("Deve retornar lista de usuários para ADMIN (200)", async () => {
		const res = await app.request("/user/users?page=1&limit=10", {
			headers: { Authorization: `Bearer ${adminToken}` },
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as any;

		expect(body.data).toBeInstanceOf(Array);
		expect(body.data.length).toBeGreaterThanOrEqual(2); // Pelo menos os 2 criados
		expect(body.meta.page).toBe(1);
		expect(body.meta.limit).toBe(10);
	});

	test("Deve negar acesso para CUSTOMER (403)", async () => {
		const res = await app.request("/user/users", {
			headers: { Authorization: `Bearer ${customerToken}` },
		});

		expect(res.status).toBe(403);
	});

	test("Deve retornar 401 se não houver token", async () => {
		const res = await app.request("/user/users");
		expect(res.status).toBe(401);
	});

	test("Deve filtrar usuários por busca textual", async () => {
		const res = await app.request(`/user/users?search=${adminEmail}`, {
			headers: { Authorization: `Bearer ${adminToken}` },
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		expect(body.data.length).toBe(1);
		expect(body.data[0].email).toBe(adminEmail);
	});
});
