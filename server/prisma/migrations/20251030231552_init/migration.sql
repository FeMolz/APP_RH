-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" UUID NOT NULL,
    "nome_cargo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" UUID NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_admissao" DATE NOT NULL,
    "data_desligamento" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cargo_id" UUID NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epis" (
    "id" UUID NOT NULL,
    "nome_epi" TEXT NOT NULL,
    "ca_numero" TEXT NOT NULL,
    "validade_ca" DATE NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "epis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_epi" (
    "id" UUID NOT NULL,
    "data_entrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "motivo_estorno" TEXT,
    "data_estorno" TIMESTAMP(3),
    "usuario_id" UUID NOT NULL,
    "funcionario_id" UUID NOT NULL,
    "epi_id" UUID NOT NULL,

    CONSTRAINT "entregas_epi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formacoes" (
    "id" UUID NOT NULL,
    "nome_formacao" TEXT NOT NULL,
    "validade_meses" INTEGER,
    "descricao" TEXT,

    CONSTRAINT "formacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quesitos" (
    "id" UUID NOT NULL,
    "descricao_quesito" TEXT NOT NULL,

    CONSTRAINT "quesitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos_formacoes" (
    "cargo_id" UUID NOT NULL,
    "formacao_id" UUID NOT NULL,

    CONSTRAINT "cargos_formacoes_pkey" PRIMARY KEY ("cargo_id","formacao_id")
);

-- CreateTable
CREATE TABLE "cargos_quesitos" (
    "cargo_id" UUID NOT NULL,
    "quesito_id" UUID NOT NULL,

    CONSTRAINT "cargos_quesitos_pkey" PRIMARY KEY ("cargo_id","quesito_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nome_cargo_key" ON "cargos"("nome_cargo");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "epis_ca_numero_key" ON "epis"("ca_numero");

-- CreateIndex
CREATE UNIQUE INDEX "quesitos_descricao_quesito_key" ON "quesitos"("descricao_quesito");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_epi" ADD CONSTRAINT "entregas_epi_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_epi" ADD CONSTRAINT "entregas_epi_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_epi" ADD CONSTRAINT "entregas_epi_epi_id_fkey" FOREIGN KEY ("epi_id") REFERENCES "epis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos_formacoes" ADD CONSTRAINT "cargos_formacoes_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos_formacoes" ADD CONSTRAINT "cargos_formacoes_formacao_id_fkey" FOREIGN KEY ("formacao_id") REFERENCES "formacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos_quesitos" ADD CONSTRAINT "cargos_quesitos_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargos_quesitos" ADD CONSTRAINT "cargos_quesitos_quesito_id_fkey" FOREIGN KEY ("quesito_id") REFERENCES "quesitos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
