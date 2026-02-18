import { Scalar } from "@scalar/hono-api-reference";
import { inspectRoutes } from "hono/dev";

const CORES_ANSI = {
	success: "\x1b[1;32m",
	error: "\x1b[1;31m",
	warning: "\x1b[1;33m",
	info: "\x1b[1;37m",
	reset: "\x1b[0m",
} as const;

export function log(message: string, cor: keyof typeof CORES_ANSI) {
	console.log(CORES_ANSI[cor] + message + CORES_ANSI.reset);
}

export function setupDocs(server: ServerType) {
	server.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "API Template - Andre OS",
			description: "Documentação automática via Hono OpenAPI",
		},
	});

	server.get(
		"/ui",
		Scalar({
			pageTitle: "Documentação da API",
			theme: "moon",
			url: "/doc",
			layout: "classic",
			hideSearch: true,
			showDeveloperTools: "never",
			hideDarkModeToggle: true,
		}),
	);

	log("Documentação OpenAPI disponível em /ui", "info");
}

export function showRoutes(app: ServerType) {
	const routes = inspectRoutes(app);

	const getPrefix = (path: string): string => {
		const parts = path.split("/").filter((p) => p.length > 0 && !p.startsWith(":"));

		if (parts.length === 0) return "/";

		return `/${parts[0]}`;
	};

	const LARGURA_METODO = 8;
	const LARGURA_CAMINHO = 59;
	let prefixoAnterior = "";

	log("Rotas registradas na API:\n ", "success");

	routes
		.filter((r) => !r.isMiddleware)
		.forEach((rota) => {
			const prefixoAtual = getPrefix(rota.path);

			if (prefixoAtual !== prefixoAnterior && prefixoAnterior !== "") {
				console.log();
			}

			const metodo = rota.method.padEnd(LARGURA_METODO - 1);
			const caminho = rota.path.padEnd(LARGURA_CAMINHO - 1);

			console.log(`${CORES_ANSI.info}${metodo}${CORES_ANSI.reset} | \x1b[32m${caminho}\x1b[0m`);

			prefixoAnterior = prefixoAtual;
		});
	console.log("");
}
