import { OrderListResponseSchema } from "@/modules/shared/schemas/order";
import { createPaginationSchema } from "@/modules/shared/utils/generatePaginationQuery";

export const OrderListQuerySchema = createPaginationSchema(["createdAt", "total"]);
export { OrderListResponseSchema };
