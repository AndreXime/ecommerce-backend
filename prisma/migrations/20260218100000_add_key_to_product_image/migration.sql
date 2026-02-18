-- AlterTable
ALTER TABLE "product_images" ADD COLUMN "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_images_key_key" ON "product_images"("key");
