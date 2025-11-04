import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const quesitoService = {

  // POST /quesitos
  criar: async (dados) => {
    const { descricao_quesito } = dados;
    return await prisma.quesito.create({
      data: {
        descricao_quesito,
      },
    });
  },

  // GET /quesitos
  listar: async () => {
    return await prisma.quesito.findMany({
      orderBy: { descricao_quesito: 'asc' },
    });
  },

  // GET /quesitos/:id
  buscarPorId: async (id) => {
    return await prisma.quesito.findUnique({
      where: { id: id },
    });
  },

  // PUT /quesitos/:id 
  atualizar: async (id, dados) => {
    const { descricao_quesito } = dados;
    return await prisma.quesito.update({
      where: { id: id },
      data: {
        descricao_quesito,
      },
    });
  },

  // DELETE /quesitos/:id 
  deletar: async (id) => {
    const uso = await prisma.quesitosEmCargo.count({
      where: { quesito_id: id },
    });

    if (uso > 0) {
      throw new Error(`Não é possível deletar. Este quesito está em uso por ${uso} cargo(s).`);
    }

    return await prisma.quesito.delete({
      where: { id: id },
    });
  },
};