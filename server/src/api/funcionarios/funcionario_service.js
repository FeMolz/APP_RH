import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const funcionarioService = {

  criar: async (dados) => {
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade, data_nascimento, empresa, telefone, localizacao, setor, step } = dados;
    return await prisma.funcionario.create({
      data: {
        nome_completo,
        cpf,
        data_admissao: new Date(data_admissao),
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        empresa,
        telefone,
        localizacao,
        setor,
        step
      },
    });
  },

  listarAtivos: async (filtros = {}) => {
    const where = { ativo: true };

    if (filtros.empresa) {
      where.empresa = filtros.empresa;
    }

    if (filtros.cargo_id) {
      where.cargo_id = filtros.cargo_id;
    }

    return await prisma.funcionario.findMany({
      where,
      include: {
        cargo: {
          select: {
            id: true,
            nome_cargo: true,
            _count: {
              select: { quesitos: true }
            }
          }
        },
        formacoes: true
      },
      orderBy: { nome_completo: 'asc' },
    });
  },

  listarInativos: async () => {
    return await prisma.funcionario.findMany({
      where: { ativo: false },
      include: {
        cargo: {
          select: {
            id: true,
            nome_cargo: true
          }
        },
        formacoes: true
      },
      orderBy: { nome_completo: 'asc' },
    });
  },

  listarAniversariantes: async () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;

    // Buscar todos os funcionarios ativos
    const funcionarios = await prisma.funcionario.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome_completo: true,
        data_admissao: true,
        empresa: true,
        setor: true
      }
    });

    // Filtrar localmente por dia e mês de admissão (aniversário de empresa)
    // Usar getUTCDate() e getUTCMonth() para evitar problemas com timezone de datas salvas no DB como YYYY-MM-DDT00:00:00Z
    return funcionarios.filter(f => {
      const admissao = new Date(f.data_admissao);
      return admissao.getUTCDate() === currentDay && (admissao.getUTCMonth() + 1) === currentMonth;
    }).sort((a, b) => new Date(a.data_admissao) - new Date(b.data_admissao));
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
    const { nome_completo, cpf, data_admissao, cargo_id, data_contabilidade, data_nascimento, empresa, telefone, localizacao, setor, step } = dados;

    return await prisma.funcionario.update({
      where: { id: id },
      data: {
        nome_completo,
        cpf,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        cargo_id,
        data_contabilidade: data_contabilidade ? new Date(data_contabilidade) : undefined,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        empresa,
        telefone,
        localizacao,
        setor,
        step
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