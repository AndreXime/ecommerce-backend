-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'CUSTOMER', 'SUPPORT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'CUSTOMER';
