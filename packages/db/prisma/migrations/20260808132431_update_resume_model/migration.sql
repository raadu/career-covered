/*
  Warnings:

  - You are about to drop the column `fileName` on the `resumes` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `resumes` table. All the data in the column will be lost.
  - Added the required column `fileSize` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFileName` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `resumes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `resumes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resumes" DROP COLUMN "fileName",
DROP COLUMN "fileUrl",
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "originalFileName" TEXT NOT NULL,
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "resumes_userId_order_idx" ON "resumes"("userId", "order");
