import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const funcionarioService = {

  criar: async (dados) => {
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade, data_nascimento } = dados;
    return await prisma.funcionario.create({
      data: {
        nome_completo,
        cpf,
        data_admissao: new Date(data_admissao),
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
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

  listarAniversariantes: async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months são 0-based

    return await prisma.funcionario.findMany({
      where: {
        ativo: true,
        data_nascimento: {
          not: null
        }
      },
      select: {
        id: true,
        nome_completo: true,
        data_nascimento: true
      },
      orderBy: [
        {
          data_nascimento: 'asc'
        }
      ]
    });
  },

  buscarPorId: async (id) => {
    return await prisma.funcionario.findUnique({
      where: { id: id },
      include: {
        cargo: true,
        formacoes: true,
      },
    });
  },

  atualizar: async (id, dados) => {
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade, data_nascimento } = dados;

    return await prisma.funcionario.update({
      where: { id: id },
      data: {
        nome_completo,
        cpf,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
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

  adicionarFormacao: async (funcionario_id, dados) => {
    const { nome_formacao, instituicao, nivel, data_inicio, data_conclusao, descricao } = dados;

    return await prisma.formacao.create({
      data: {
        nome_formacao,
        instituicao,
        nivel,
        data_inicio: new Date(data_inicio),
        data_conclusao: new Date(data_conclusao),
        descricao,
        funcionario_id: funcionario_id,
      },
    });
  },

};