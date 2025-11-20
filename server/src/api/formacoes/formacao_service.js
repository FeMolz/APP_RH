import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const formacaoService = {

  deletar: async (id) => {
    return await prisma.formacao.delete({
      where: { id: id },
    });
  },

  create: async (data) => {
    return await prisma.formacao.create({
      data: {
        nome_formacao: data.nome_formacao,
        instituicao: data.instituicao,
        nivel: data.nivel,
        data_inicio: new Date(data.data_inicio),
        data_conclusao: new Date(data.data_conclusao),
        descricao: data.descricao,
        funcionario_id: data.funcionario_id,
      },
    });
  },

  listar: async () => {
    return await prisma.formacao.findMany({
      where: {
        funcionario: {
          ativo: true
        }
      },
      include: {
        funcionario: {
          select: {
            nome_completo: true,
          },
        },
      },
    });
  },

  atualizar: async (id, data) => {
    return await prisma.formacao.update({
      where: { id: id },
      data: {
        nome_formacao: data.nome_formacao,
        instituicao: data.instituicao,
        nivel: data.nivel,
        data_inicio: new Date(data.data_inicio),
        data_conclusao: new Date(data.data_conclusao),
        descricao: data.descricao,
        funcionario_id: data.funcionario_id,
      },
    });
  },
};