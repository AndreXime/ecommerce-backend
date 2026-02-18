import { z } from "@hono/zod-openapi";

export const AddressRemoveParamSchema = z.object({
	addressId: z.string().uuid(),
});
