import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "@/@types/declarations";

import { database as db } from "@/database/database";

const database: MiddlewareHandler<AppBindings> = async (ctx, next) => {
	ctx.database = db;

	return await next();
};

export default database;
