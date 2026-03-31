import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { HtmlRenderingConfiguration } from "@scalar/core/libs/html-rendering";
import type { AppBindings } from "@/@types/declarations";

const envExamplePath = join(process.cwd(), ".env.example");
const envExampleContent = await Bun.file(envExamplePath).text();

for (const line of envExampleContent.split("\n")) {
	const trimmedLine = line.trim();

	if (!trimmedLine || trimmedLine.startsWith("#")) {
		continue;
	}

	const separatorIndex = trimmedLine.indexOf("=");
	if (separatorIndex === -1) {
		continue;
	}

	const environmentKey = trimmedLine.slice(0, separatorIndex).trim();
	const rawEnvironmentValue = trimmedLine.slice(separatorIndex + 1).trim();
	const environmentValue = rawEnvironmentValue.replace(/^"(.*)"$/, "$1");

	process.env[environmentKey] ??= environmentValue;
}

const app = new OpenAPIHono<AppBindings>();
const { registerRoutes } = await import("@/modules");

registerRoutes(app);

const openApiDocument = app.getOpenAPI31Document({
	openapi: "3.1.0",
	info: {
		version: "1.0.0",
		title: "API Ecommerce",
		description:
			"Documentação automática via Hono OpenAPI para visualização estática. Este HTML não suporta interação.",
	},
	servers: [
		{
			url: "https://github.com/AndreXime/ecommerce-backend",
		},
	],
});

const docsDirectory = join(process.cwd(), "dist", "docs");
const htmlFilePath = join(docsDirectory, "index.html");

const scalarConfig: Partial<HtmlRenderingConfiguration> = {
	theme: "moon",
	layout: "classic",
	pageTitle: "Documentação da API",
	hideSearch: true,
	showDeveloperTools: "never",
	hideDarkModeToggle: true,
	hiddenClients: true,
};

const scalarHtml = `<!doctype html>
<html>
  <head>
    <title>${scalarConfig.pageTitle}</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script type="text/javascript">
      Scalar.createApiReference('#app', ${JSON.stringify({
				...scalarConfig,
				content: openApiDocument,
			})})
    </script>
  </body>
</html>
`;

await mkdir(docsDirectory, { recursive: true });
await Bun.write(htmlFilePath, scalarHtml);

console.log(`HTML da documentação gerado em ${htmlFilePath}`);

process.exit(0);
