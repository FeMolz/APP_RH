/*
  Warnings:

  - You are about to drop the column `validade_meses` on the `formacoes` table. All the data in the column will be lost.
  - You are about to drop the `cargos_formacoes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `data_conclusao` to the `formacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_inicio` to the `formacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `funcionario_id` to the `formacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituicao` to the `formacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel` to the `formacoes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cargos_formacoes" DROP CONSTRAINT "cargos_formacoes_cargo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cargos_formacoes" DROP CONSTRAINT "cargos_formacoes_formacao_id_fkey";

-- AlterTable
ALTER TABLE "formacoes" DROP COLUMN "validade_meses",
ADD COLUMN     "data_conclusao" DATE NOT NULL,
ADD COLUMN     "data_inicio" DATE NOT NULL,
ADD COLUMN     "funcionario_id" UUID NOT NULL,
ADD COLUMN     "instituicao" TEXT NOT NULL,
ADD COLUMN     "nivel" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."cargos_formacoes";

-- AddForeignKey
ALTER TABLE "formacoes" ADD CONSTRAINT "formacoes_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
