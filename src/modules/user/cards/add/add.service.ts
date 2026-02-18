import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import type { CardAddBodySchema } from "./add.schema";

type Body = z.infer<typeof CardAddBodySchema>;

export async function addCard(userId: string, body: Body) {
	return database.paymentCard.create({ data: { ...body, userId } });
}
