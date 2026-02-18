import { z } from "@hono/zod-openapi";
import { AddressSchema } from "@/modules/shared/schemas/address";

export const AddressUpdateParamSchema = z.object({
	addressId: z.string().uuid(),
});

export const AddressUpdateBodySchema = z.object({
	type: z.string().min(1).optional(),
	street: z.string().min(5).optional(),
	city: z.string().min(2).optional(),
	isDefault: z.boolean().optional(),
});

export { AddressSchema as AddressUpdateResponseSchema };
