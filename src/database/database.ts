import { PrismaPg } from "@prisma/adapter-pg";
import { spawn } from "bun";
import { Pool } from "pg";
import { PrismaClient } from "prisma";
import { log } from "@/lib/dev";
import environment from "@/lib/environment";

class PrismaService {
	private client: PrismaClient | null = null;

	// Configurações do Retry
	private maxRetries: number = 10;
	private initialDelayMs: number = 1000;

	private configPrisma() {
		const isRDS = environment.DATABASE_URL.includes("amazonaws.com") || environment.ENV === "PROD";

		const pool = new Pool({
			connectionString: environment.DATABASE_URL,
			ssl: isRDS ? { rejectUnauthorized: false } : undefined,
		});
		const adapter = new PrismaPg(pool);

		// Inicializa o PrismaClient na primeira vez.
		return new PrismaClient({ adapter });
	}

	public getPrismaInstance() {
		this.client = this.configPrisma();
		return this.client;
	}

	/**
	 * Tenta conectar o Prisma Client com retry
	 */
	public async testConnection() {
		if (!this.client) {
			this.client = this.configPrisma();
		}

		let retries = 0;

		while (retries < this.maxRetries) {
			try {
				if (retries > 0) {
					console.log(`Tentando conectar ao banco de dados (Tentativa ${retries + 1} de ${this.maxRetries})...`);
				}

				await this.client.$connect();

				log("Conexão com banco de dados bem-sucedida.", "success");
				return;
			} catch (error) {
				retries++;

				if (retries >= this.maxRetries) {
					// Servidor deve parar se não tiver conexão
					throw new Error(
						`Falha Crítica de Conexão com o Banco de Dados falhou após ${this.maxRetries} tentativas.\n${error}`,
					);
				}

				// Cálculo do Backoff Exponencial: Atraso = initialDelayMs * 2^(retries - 1)
				const currentDelay = this.initialDelayMs * 2 ** (retries - 1);

				console.warn(`⚠️ Erro de conexão. Tentando novamente em ${currentDelay / 1000}s...`);
				await new Promise((resolve) => setTimeout(resolve, currentDelay));
			}
		}
		throw new Error("Falha de Conexão Inesperada.");
	}

	public async deployMigrations() {
		if (environment.ENV === "PROD") {
			await this.tempFixMigrations();
		}

		const command = ["bunx", "prisma", "migrate", "deploy"];

		const prismaProcess = spawn(command, {
			stdio: ["ignore", "pipe", "pipe"],
		});

		const stdoutPromise = new Response(prismaProcess.stdout).text();
		const stderrPromise = new Response(prismaProcess.stderr).text();

		const [exitCode, stdout, stderr] = await Promise.all([prismaProcess.exited, stdoutPromise, stderrPromise]);

		if (exitCode === 0) {
			log("Migrações aplicadas no banco de dados com sucesso!", "success");
		} else {
			log(`ERROR: Falha ao aplicar as migrações.`, "error");
			console.log(stderr);
			console.log(stdout);
		}
	}

	/**
	 * Se alguma migração der errado e não for aplicado na produção deve-se modificar o .sql da migração
	 * e usa essa função pra dar rollback na migração que falhou
	 */
	private async tempFixMigrations() {
		/*
		const command = ["bunx", "prisma", "migrate", "resolve", "--rolled-back", "20251230180645"];

		const prismaProcess = spawn(command, {
			stdio: ["ignore", "pipe", "pipe"],
		});

		const stdoutPromise = new Response(prismaProcess.stdout).text();
		const stderrPromise = new Response(prismaProcess.stderr).text();

		const [exitCode, stdout, stderr] = await Promise.all([prismaProcess.exited, stdoutPromise, stderrPromise]);

		if (exitCode === 0) {
			log("Migrações corrigidas com sucesso!", "success");
		} else {
			log(`ERROR: Falha ao aplicar as migrações.`, "error");
			console.log(stderr);
			console.log(stdout);
		}
		*/
	}
}

export const PrismaDatabase = new PrismaService();

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient;
};

const database = globalForPrisma.prisma || PrismaDatabase.getPrismaInstance();

type Database = typeof database;

export { database };
export type { Database };

if (environment.ENV !== "PROD") globalForPrisma.prisma = database;
