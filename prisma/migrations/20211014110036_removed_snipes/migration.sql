/*
  Warnings:

  - You are about to drop the `EditSnipes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Snipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "EditSnipes";

-- DropTable
DROP TABLE "Snipes";

-- CreateTable
CREATE TABLE "Guild" (
    "id" INTEGER NOT NULL,
    "prefix" VARCHAR(10) NOT NULL DEFAULT E'mc!',

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);
