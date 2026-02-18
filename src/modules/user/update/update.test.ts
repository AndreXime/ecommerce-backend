import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { database } from "@/database/database";
import app from "@/index";
import environment from "@/lib/environment";
import { hashPassword } from "@/modules/auth/shared/hash";

const makeToken = async (id: string, email: string, name: string, role: "ADMIN" | "CUSTOMER") =>
	sign(
		{ id, email, name, role, jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + 300 },
		environment.JWT_SECRET,
	);

describe("PUT /users", () => {
	const password = "senha123";
	let userId = "";
	let otherUserId = "";
	let adminId = "";
	let userToken = "";
	let _otherUserToken = "";
	let adminToken = "";

	beforeAll(async () => {
		const hashed = await hashPassword(password);

		const [user, other, admin] = await Promise.all([
			database.user.create({
				data: { name: "Update User", email: `update_user_${Date.now()}@example.com`, password: hashed },
			}),
			database.user.create({
				data: { name: "Other User", email: `update_other_${Date.now()}@example.com`, password: hashed },
			}),
			database.user.create({
				data: {
					name: "Admin User",
					email: `update_admin_${Date.now()}@example.com`,
					password: hashed,
					role: "ADMIN",
				},
			}),
		]);

		userId = user.id;
		otherUserId = other.id;
		adminId = admin.id;

		[userToken, _otherUserToken, adminToken] = await Promise.all([
			makeToken(user.id, user.email, user.name, "CUSTOMER"),
			makeToken(other.id, other.email, other.name, "CUSTOMER"),
			makeToken(admin.id, admin.email, admin.name, "ADMIN"),
		]);
	});

	afterAll(async () => {
		await database.user.deleteMany({
			where: { id: { in: [userId, otherUserId, adminId] } },
		});
	});

	const put = (body: object, token?: string) =>
		app.request("/users", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify(body),
		});

	test("Deve retornar 401 sem token", async () => {
		const res = await put({ id: userId, name: "Novo Nome" });
		expect(res.status).toBe(401);
	});

	test("Deve atualizar o próprio nome (200)", async () => {
		const res = await put({ id: userId, name: "Nome Atualizado" }, userToken);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { name: string; password?: string };
		expect(body.name).toBe("Nome Atualizado");
		expect(body.password).toBeUndefined();
	});

	test("Deve atualizar a própria senha com a senha atual correta (200)", async () => {
		const res = await put({ id: userId, currentPassword: password, newPassword: "novaSenha123" }, userToken);
		expect(res.status).toBe(200);
	});

	test("Deve retornar 401 com senha atual incorreta", async () => {
		const res = await put({ id: userId, currentPassword: "senhaErrada", newPassword: "novaSenha123" }, userToken);
		expect(res.status).toBe(401);
	});

	test("Deve retornar 403 ao tentar atualizar outro usuário sem ser admin", async () => {
		const res = await put({ id: otherUserId, name: "Invasão" }, userToken);
		expect(res.status).toBe(403);
	});

	test("Admin deve conseguir atualizar qualquer usuário (200)", async () => {
		const res = await put({ id: otherUserId, name: "Atualizado pelo Admin" }, adminToken);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { name: string };
		expect(body.name).toBe("Atualizado pelo Admin");
	});

	test("Deve retornar 422 sem campos para atualizar", async () => {
		const res = await put({ id: userId }, userToken);
		expect(res.status).toBe(422);
	});

	test("Deve retornar 422 com newPassword sem currentPassword", async () => {
		const res = await put({ id: userId, newPassword: "novaSenha123" }, userToken);
		expect(res.status).toBe(422);
	});
});
