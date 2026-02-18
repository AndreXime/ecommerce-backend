import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { getPaginationArgs } from "@/modules/shared/utils/generatePaginationQuery";
import { toOrder } from "@/modules/shared/utils/orderMapper";
import type { OrderListQuerySchema } from "./list.schema";

type Query = z.infer<typeof OrderListQuerySchema>;

export async function listOrders(userId: string, isAdmin: boolean, query: Query) {
	const { page, limit, sortBy, sortOrder } = query;
	const { skip, take, orderBy } = getPaginationArgs({ page, limit, sortBy, sortOrder });

	const where = isAdmin ? {} : { userId };

	const [orders, total] = await Promise.all([
		database.order.findMany({ skip, take, orderBy, where, include: { items: true } }),
		database.order.count({ where }),
	]);

	return {
		data: orders.map(toOrder),
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}
