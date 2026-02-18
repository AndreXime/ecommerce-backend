import { z } from "@hono/zod-openapi";
import { AddressSchema } from "@/modules/shared/schemas/address";

export const AddressAddBodySchema = z.object({
	type: z.string().min(1),
	street: z.string().min(5),
	city: z.string().min(2),
	isDefault: z.boolean().optional().default(false),
});

export { AddressSchema as AddressAddResponseSchema };
