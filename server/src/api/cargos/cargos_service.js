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

  listarInativos: async () => {
    return await prisma.cargo.findMany({
      where: { ativo: false },
      orderBy: { nome_cargo: 'asc' },
    });
  },

  buscarPorId: async (id) => {
    return await prisma.cargo.findUnique({
      where: { id: id },
      include: {
        quesitos: {
          include: {
            quesito: true
          }
        }
      }
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

  adicionarQuesito: async (cargo_id, quesito_id) => {
    return await prisma.quesitosEmCargo.create({
      data: {
        cargo_id: cargo_id,
        quesito_id: quesito_id,
      },
    });
  },

  removerQuesito: async (cargo_id, quesito_id) => {
    return await prisma.quesitosEmCargo.delete({
      where: {
        cargo_id_quesito_id: {
          cargo_id: cargo_id,
          quesito_id: quesito_id,
        },
      },
    });
  },
};