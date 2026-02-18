import { z } from "@hono/zod-openapi";
import { PaymentCardSchema } from "@/modules/shared/schemas/address";

export const CardAddBodySchema = z.object({
	brand: z.string().min(2),
	last4: z.string().length(4),
	holder: z.string().min(3),
	expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Formato inválido. Use MM/AA"),
});

export { PaymentCardSchema as CardAddResponseSchema };
