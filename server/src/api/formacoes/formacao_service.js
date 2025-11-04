import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const formacaoService = {

  deletar: async (id) => {
    return await prisma.formacao.delete({
      where: { id: id },
    });
  },
};