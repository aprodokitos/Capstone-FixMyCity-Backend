/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_reportId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "reportId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Comment_id_seq";

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Report_id_seq";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
