import "dotenv/config";
import path from "node:path";
import { env, type PrismaConfig } from "prisma/config";

export default {
	schema: path.join("prisma"),
	migrations: {
		path: path.join("prisma", "migrations"),
		seed: "bun run src/database/seed/seed.ts",
	},
	datasource: {
		url: process.env.DATABASE_URL || env("DATABASE_URL"),
	},
} satisfies PrismaConfig;
