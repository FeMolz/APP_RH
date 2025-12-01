import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const entregaService = {
    async listarTodas() {
        return await prisma.entregasEPI.findMany({
            include: {
                usuario: {
                    select: {
                        nome: true,
                        email: true,
                    },
                },
                funcionario: {
                    select: {
                        nome_completo: true,
                        cpf: true,
                    },
                },
                epi: {
                    select: {
                        nome_epi: true,
                        ca_numero: true,
                    },
                },
            },
            orderBy: {
                data_entrega: 'desc',
            },
        });
    },

    async criar(dados) {
        const { funcionario_id, epi_id, usuario_id, quantidade, validade_dias, data_entrega } = dados;

        return await prisma.entregasEPI.create({
            data: {
                funcionario_id,
                epi_id,
                usuario_id,
                quantidade: parseInt(quantidade),
                validade_dias: validade_dias ? parseInt(validade_dias) : null,
                data_entrega: data_entrega ? new Date(data_entrega) : undefined
            },
        });
    },

    async listarPorFuncionario(funcionarioId, status = null) {
        const where = { funcionario_id: funcionarioId };
        if (status) {
            where.status = status;
            // If listing returned items, only show those not yet reported
            if (status === 'DEVOLVIDO') {
                where.relatorio_id = null;
            }
        }

        return await prisma.entregasEPI.findMany({
            where,
            include: {
                epi: true,
                usuario: { select: { nome: true } }
            },
            orderBy: { data_entrega: 'desc' }
        });
    },

    async listarVencidos() {
        // 1. Get ALL active deliveries
        const entregasAtivas = await prisma.entregasEPI.findMany({
            where: {
                status: 'ATIVO'
            },
            include: {
                funcionario: {
                    select: { id: true, nome_completo: true, ativo: true }
                },
                epi: {
                    select: { id: true, nome_epi: true, validade_dias: true, ativo: true }
                }
            }
        });

        const vencidos = [];
        const hoje = new Date();

        for (const entrega of entregasAtivas) {
            // Skip if employee or EPI is inactive (optional, but good practice)
            if (!entrega.funcionario.ativo || !entrega.epi.ativo) continue;

            const dataEntrega = new Date(entrega.data_entrega);
            const dataVencimento = new Date(dataEntrega);

            // Use the delivery specific validity if available, otherwise use the EPI default
            const diasValidade = entrega.validade_dias || entrega.epi.validade_dias || 365;
            dataVencimento.setDate(dataVencimento.getDate() + diasValidade);

            if (dataVencimento < hoje) {
                vencidos.push({
                    id: entrega.id,
                    funcionario: entrega.funcionario,
                    epi: entrega.epi,
                    ultima_entrega: entrega.data_entrega,
                    vencimento: dataVencimento,
                    dias_vencido: Math.floor((hoje - dataVencimento) / (1000 * 60 * 60 * 24))
                });
            }
        }

        return vencidos;
    },

    async devolver(id, data_devolucao) {
        return await prisma.entregasEPI.update({
            where: { id },
            data: {
                status: 'DEVOLVIDO',
                data_devolucao: data_devolucao ? new Date(data_devolucao) : new Date()
            }
        });
    }
};
