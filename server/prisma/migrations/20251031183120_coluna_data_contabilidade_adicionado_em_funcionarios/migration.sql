/*
  Warnings:

  - Added the required column `data_contabilidade` to the `funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "data_contabilidade" DATE NOT NULL;
