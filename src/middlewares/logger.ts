import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "@/@types/declarations";

const requestLogger: MiddlewareHandler<AppBindings> = async (ctx, next) => {
	const { method, url } = ctx.req;
	const startTime = Date.now();

	await next();

	const endTime = Date.now();
	const duration = endTime - startTime;
	const status = ctx.res.status;

	const getStatusColor = (s: number): string => {
		if (s >= 500) return `\x1b[31m${s}\x1b[0m`; // Vermelho (Erros de Servidor)
		if (s >= 400) return `\x1b[33m${s}\x1b[0m`; // Amarelo (Erros de Cliente)
		if (s >= 300) return `\x1b[36m${s}\x1b[0m`; // Ciano (Redirecionamento)
		if (s >= 200) return `\x1b[32m${s}\x1b[0m`; // Verde (Sucesso)
		return String(s);
	};

	const coloredStatus = getStatusColor(status);
	if (method === "OPTIONS" || url.includes("favicon")) return;
	console.log(`${method} para ${url} ${coloredStatus} (${duration}ms)`);

	// Mostra o body se der status de erro
	if (status >= 300) {
		const originalResponse = ctx.res;
		let responseBody = "N/A";

		const contentType = originalResponse.headers.get("content-type");

		try {
			if (originalResponse.body && contentType?.includes("application/json")) {
				// Usa .clone() para ler o corpo sem consumi-lo para o cliente
				const clonedResponse = originalResponse.clone();

				const jsonBody = await clonedResponse.json();
				responseBody = JSON.stringify(jsonBody, null, 2);
			}
		} catch {
			responseBody = `Não foi possível ler o corpo.`;
		}

		console.log(responseBody);
	}
};

export default requestLogger;
