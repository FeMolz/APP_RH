/*
  Warnings:

  - Added the required column `empresa` to the `funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."epis_ca_numero_key";

-- AlterTable
ALTER TABLE "entregas_epi" ADD COLUMN     "data_devolucao" TIMESTAMP(3),
ADD COLUMN     "relatorio_id" UUID,
ADD COLUMN     "validade_dias" INTEGER;

-- AlterTable
ALTER TABLE "epis" ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validade_dias" INTEGER NOT NULL DEFAULT 365,
ALTER COLUMN "validade_ca" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "empresa" TEXT NOT NULL,
ADD COLUMN     "localizacao" TEXT,
ADD COLUMN     "telefone" TEXT;

-- CreateTable
CREATE TABLE "relatorios_entrega" (
    "id" UUID NOT NULL,
    "data_geracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caminho_arquivo" TEXT,
    "arquivo_dados" BYTEA,
    "funcionario_id" UUID NOT NULL,

    CONSTRAINT "relatorios_entrega_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "entregas_epi" ADD CONSTRAINT "entregas_epi_relatorio_id_fkey" FOREIGN KEY ("relatorio_id") REFERENCES "relatorios_entrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios_entrega" ADD CONSTRAINT "relatorios_entrega_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
