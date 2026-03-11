import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const epiService = {

  criar: async (dados) => {
    const { nome_epi, ca_numero, validade_ca, descricao, validade_dias, isento } = dados;

    return await prisma.ePI.create({
      data: {
        nome_epi,
        ca_numero: ca_numero || null,
        validade_ca: validade_ca ? new Date(validade_ca) : null,
        isento: isento || false,
        descricao,
        validade_dias: validade_dias ? parseInt(validade_dias) : 365,
      },
    });
  },

  listarAtivos: async () => {
    return await prisma.ePI.findMany({
      where: { ativo: true },
      orderBy: { nome_epi: 'asc' },
    });
  },

  buscarPorId: async (id) => {
    return await prisma.ePI.findUnique({
      where: { id: id },
    });
  },

  atualizar: async (id, dados) => {
    const { nome_epi, ca_numero, validade_ca, descricao, ativo, validade_dias, isento } = dados;

    return await prisma.ePI.update({
      where: { id: id },
      data: {
        nome_epi,
        ca_numero: ca_numero || null,
        validade_ca: validade_ca ? new Date(validade_ca) : null,
        isento: isento !== undefined ? isento : undefined,
        descricao,
        validade_dias: validade_dias ? parseInt(validade_dias) : undefined,
        ativo,
      },
    });
  },

  inativar: async (id) => {
    return await prisma.ePI.update({
      where: { id: id },
      data: { ativo: false },
    });
  },
};