CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'delivered', 'intransit', 'cancelled');

ALTER TABLE "orders"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "orders"
ALTER COLUMN "status" TYPE "OrderStatus_new"
USING ("status"::text::"OrderStatus_new");

DROP TYPE "OrderStatus";

ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

ALTER TABLE "products"
ADD COLUMN "stock_quantity" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "products"
ADD CONSTRAINT "products_stock_quantity_nonnegative" CHECK ("stock_quantity" >= 0);

ALTER TABLE "order_items"
RENAME COLUMN "price" TO "unit_price";

ALTER TABLE "order_items"
ADD COLUMN "discount_percentage" DECIMAL(5,2),
ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "order_items"
SET "subtotal" = "unit_price" * "quantity";

ALTER TABLE "orders"
ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "products"
ALTER COLUMN "inStock" SET DEFAULT false;
