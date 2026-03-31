-- AlterTable
ALTER TABLE "users"
ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "cart_items"
ADD COLUMN "variant_signature" TEXT NOT NULL DEFAULT '';

-- Backfill variant signature from existing selected_variant
UPDATE "cart_items"
SET "variant_signature" = COALESCE(
  (
    SELECT jsonb_object_agg("key", "value")
    FROM (
      SELECT "key", "value"
      FROM jsonb_each_text(COALESCE("selected_variant", '{}'::jsonb))
      ORDER BY "key"
    ) AS ordered_variant
  )::text,
  ''
)
WHERE "selected_variant" IS NOT NULL;

-- Replace old cart item uniqueness with variant-aware uniqueness
DROP INDEX "cart_items_cartId_productId_key";

CREATE UNIQUE INDEX "cart_items_cartId_productId_variant_signature_key"
ON "cart_items"("cartId", "productId", "variant_signature");

-- Enforce at most one default address per user
CREATE UNIQUE INDEX "addresses_user_default_unique"
ON "addresses"("userId")
WHERE "is_default" = true;
