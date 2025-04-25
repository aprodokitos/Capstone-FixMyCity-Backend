-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'DIPROSES', 'SELESAI');

-- CreateTable
CREATE TABLE "User" (
    "id_user" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_birthday" TIMESTAMP(3) NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_profile" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "role_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Role" (
    "id_role" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "Report" (
    "id_report" TEXT NOT NULL, 
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id_report")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
