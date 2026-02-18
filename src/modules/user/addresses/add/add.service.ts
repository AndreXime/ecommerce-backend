import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import type { AddressAddBodySchema } from "./add.schema";

type Body = z.infer<typeof AddressAddBodySchema>;

export async function addAddress(userId: string, body: Body) {
	// Se isDefault, remove o default anterior
	if (body.isDefault) {
		await database.address.updateMany({
			where: { userId, isDefault: true },
			data: { isDefault: false },
		});
	}

	return database.address.create({ data: { ...body, userId } });
}
