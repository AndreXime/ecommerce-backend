import { z } from "@hono/zod-openapi";
import { AddressSchema, PaymentCardSchema } from "@/modules/shared/schemas/address";
import { OrderSchema } from "@/modules/shared/schemas/order";
import { ProductSummarySchema } from "@/modules/shared/schemas/product";

export const MeResponseSchema = z.object({
	personalData: z.object({
		name: z.string(),
		email: z.string(),
		registration: z.string().nullable(),
		phone: z.string().nullable(),
		registredAt: z.iso.datetime(),
	}),
	ordersHistory: z.array(OrderSchema),
	wishlistProducts: z.array(ProductSummarySchema),
	paymentCards: z.array(PaymentCardSchema),
	addresses: z.array(AddressSchema),
});
