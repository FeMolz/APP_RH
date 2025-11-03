import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const funcionarioService = {

  criar: async (dados) => {
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade } = dados;
    return await prisma.funcionario.create({
      data: {
        nome_completo,
        cpf,
        data_admissao: new Date(data_admissao),
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
      },
    });
  },

  listarAtivos: async () => {
    return await prisma.funcionario.findMany({
      where: { ativo: true },
      include: {

        cargo: {
          select: {
            nome_cargo: true
          }
        }
      },
      orderBy: { nome_completo: 'asc' },
    });
  },

  buscarPorId: async (id) => {
    return await prisma.funcionario.findUnique({
      where: { id: id },
      include: {
        cargo: true,
      },
    });
  },

  atualizar: async (id, dados) => {
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade } = dados;

    return await prisma.funcionario.update({
      where: { id: id },
      data: {
        nome_completo,
        cpf,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
      },
    });
  },

  desligar: async (id) => {
    return await prisma.funcionario.update({
      where: { id: id },
      data: {
        ativo: false,
        data_desligamento: new Date(),
      },
    });
  },
};