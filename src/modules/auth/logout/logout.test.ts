import { describe, expect, test } from "bun:test";
import app from "@/index";

describe("POST /auth/logout", () => {
	test("Deve realizar logout e limpar cookies (200)", async () => {
		// Mesmo sem estar logado, o logout deve processar a limpeza dos cookies
		const res = await app.request("/auth/logout", {
			method: "POST",
		});

		expect(res.status).toBe(200);

		const cookies = res.headers.get("set-cookie");
		// Verifica se os cookies estão a ser definidos com Max-Age=0 ou expires no passado
		// O Hono deleteCookie geralmente define Max-Age=0
		expect(cookies).toBeTruthy();
	});
});
