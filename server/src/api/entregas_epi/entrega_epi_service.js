import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const entregaEpiService = {
  
  listarPendentes: async () => {
    // 1. Buscar todos os funcionários ativos com seus cargos, EPIs exigidos pelo cargo e o histórico de entregas do funcionário
    const funcionarios = await prisma.funcionario.findMany({
      where: { ativo: true },
      include: {
        cargo: {
          include: {
            epis: {
              include: {
                epi: true // Detalhes do EPI exigido
              }
            }
          }
        },
        entregas_epi: {
          orderBy: { data_vencimento: 'desc' } // Queremos sempre olhar a entrega mais recente de cada EPI
        }
      },
      orderBy: { nome_completo: 'asc' }
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const resultados = [];

    // 2. Processar cada funcionário para encontrar pendências
    for (const func of funcionarios) {
      if (!func.cargo || !func.cargo.epis || func.cargo.epis.length === 0) continue;

      const episPendentes = [];

      for (const vinculo of func.cargo.epis) {
        const epiExigido = vinculo.epi;
        
        if(!epiExigido.ativo) continue;

        // Procurar o histórico de entrega MAIS RECENTE para este EPI específico neste funcionário
        const ultimaEntrega = func.entregas_epi.find(e => e.epi_id === epiExigido.id);

        let statusPendente = null;
        let dataExpiracao = null;

        if (!ultimaEntrega) {
          statusPendente = 'NUNCA_ENTREGUE';
        } else {
          // Calcula sempre de forma dinâmica para que alterações em 'validade_dias' atuem retroativamente.
          const dataEntregaStr = ultimaEntrega.data_entrega.toISOString().split('T')[0];
          const dataVenc = new Date(dataEntregaStr + 'T00:00:00');
          dataVenc.setDate(dataVenc.getDate() + epiExigido.validade_dias);

          if (dataVenc < hoje) {
            statusPendente = 'VENCIDO';
          } else {
            statusPendente = 'EM_DIA';
          }
          dataExpiracao = dataVenc;
        }

        episPendentes.push({
          epi_id: epiExigido.id,
          nome_epi: epiExigido.nome_epi,
          ca_numero: epiExigido.ca_numero,
          isento: epiExigido.isento,
          validade_dias: epiExigido.validade_dias,
          status: statusPendente,
          data_expiracao: dataExpiracao
        });
      }

      if (episPendentes.length > 0) {
        resultados.push({
          funcionario_id: func.id,
          nome_completo: func.nome_completo,
          cargo_nome: func.cargo.nome_cargo,
          epis_pendentes: episPendentes
        });
      }
    }

    return resultados;
  },

  registrarEntrega: async (dados) => {
    const { funcionario_id, epi_id, data_entrega } = dados;

    const dataEntregaObj = new Date(data_entrega);

    // 1. Buscar a validade do EPI para calcular o vencimento
    const epi = await prisma.ePI.findUnique({ where: { id: epi_id } });
    if (!epi) throw new Error("EPI não encontrado");

    // 2. Calcular data de vencimento: data_entrega + validade_dias
    const dataVencimentoObj = new Date(dataEntregaObj);
    dataVencimentoObj.setDate(dataVencimentoObj.getDate() + epi.validade_dias);

    // 3. Registrar no banco
    const novaEntrega = await prisma.entregaEPI.create({
      data: {
        funcionario_id,
        epi_id,
        data_entrega: dataEntregaObj,
        data_vencimento: dataVencimentoObj
      }
    });

    return novaEntrega;
  },

  buscarEntregasPorPeriodo: async (funcionario_id, data_inicio, data_fim) => {
    const inicio = new Date(`${data_inicio}T00:00:00.000Z`);
    const fim = new Date(`${data_fim}T23:59:59.999Z`);

    const entregas = await prisma.entregaEPI.findMany({
      where: {
        funcionario_id: funcionario_id,
        data_entrega: {
          gte: inicio,
          lte: fim
        }
      },
      include: {
        epi: true,
        funcionario: {
          include: {
            cargo: true
          }
        }
      },
      orderBy: {
        data_entrega: 'desc'
      }
    });

    return entregas;
  }
};
