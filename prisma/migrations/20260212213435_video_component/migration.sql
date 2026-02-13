/*
  Warnings:

  - Added the required column `description` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
