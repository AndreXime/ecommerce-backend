import { z } from "@hono/zod-openapi";

export const OrderItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	variant: z.string().nullable().optional(),
	img: z.string().nullable().optional(),
	quantity: z.number().int(),
	price: z.number(),
});

export const OrderSchema = z.object({
	id: z.string().uuid(),
	date: z.iso.datetime(),
	total: z.number(),
	status: z.enum(["delivered", "intransit", "cancelled"]),
	items: z.array(OrderItemSchema),
});

export const OrderListResponseSchema = z.object({
	data: z.array(OrderSchema),
	meta: z.object({
		page: z.number().int(),
		limit: z.number().int(),
		total: z.number().int(),
		totalPages: z.number().int(),
	}),
});
