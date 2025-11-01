import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const cargosService = {

  criar: async (dados) => {
    const { nome_cargo, descricao } = dados;
    return await prisma.cargo.create({
      data: {
        nome_cargo,
        descricao,
      },
    });
  },

  listarAtivos: async () => {
    return await prisma.cargo.findMany({
      where: { ativo: true },
      orderBy: { nome_cargo: 'asc' },
    });
  },

  buscarPorId: async (id) => {
    return await prisma.cargo.findUnique({
      where: { id: id },
    });
  },

  atualizar: async (id, dados) => {
    const { nome_cargo, descricao } = dados;
    return await prisma.cargo.update({
      where: { id: id },
      data: {
        nome_cargo,
        descricao,
      },
    });
  },

  inativar: async (id) => {
    return await prisma.cargo.update({
      where: { id: id },
      data: { ativo: false },
    });
  },
};