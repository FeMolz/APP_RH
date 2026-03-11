/*
  Warnings:

  - You are about to drop the `entregas_epi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `relatorios_entrega` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bloco` to the `quesitos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."entregas_epi" DROP CONSTRAINT "entregas_epi_epi_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas_epi" DROP CONSTRAINT "entregas_epi_funcionario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas_epi" DROP CONSTRAINT "entregas_epi_relatorio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas_epi" DROP CONSTRAINT "entregas_epi_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."relatorios_entrega" DROP CONSTRAINT "relatorios_entrega_funcionario_id_fkey";

-- AlterTable
ALTER TABLE "quesitos" ADD COLUMN     "bloco" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."entregas_epi";

-- DropTable
DROP TABLE "public"."relatorios_entrega";

-- CreateTable
CREATE TABLE "cargos_epis" (
    "cargo_id" UUID NOT NULL,
    "epi_id" UUID NOT NULL,

    CONSTRAINT "cargos_epis_pkey" PRIMARY KEY ("cargo_id","epi_id")
);

-- AddForeignKey
ALTER TABLE "cargos_epis" ADD CONSTRAINT "cargos_epis_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos_epis" ADD CONSTRAINT "cargos_epis_epi_id_fkey" FOREIGN KEY ("epi_id") REFERENCES "epis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
