import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import type { AddressAddBodySchema } from "./add.schema";

type Body = z.infer<typeof AddressAddBodySchema>;

export async function addAddress(userId: string, body: Body) {
	return database.$transaction(async (tx) => {
		if (body.isDefault) {
			await tx.address.updateMany({
				where: { userId, isDefault: true },
				data: { isDefault: false },
			});
		}

		return tx.address.create({ data: { ...body, userId } });
	});
}
