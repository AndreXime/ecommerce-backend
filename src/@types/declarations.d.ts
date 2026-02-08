import type { Roles } from "@/database/client/enums";
import type { Database } from "@/database/database";
import type server from "@/index";
import type { environmentType } from "@/lib/environment";

declare global {
	type ServerType = typeof server;
}

type AppBindings = {
	Bindings: environmentType;
	Variables: {
		user: JWT;
		database: Database;
	};
};

type JWT = {
	id: string;
	email: string;
	name: string;
	role: Roles;
	jti: string;
	exp: number;
};

declare module "hono" {
	interface Context {
		user: JWT;
		database: Database;
	}
}

export type { AppBindings, JWT };
