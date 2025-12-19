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

    async listarParaRelatorio(funcionarioId, dataInicio, dataFim) {
        try {
            console.log('--- Debug Relatorio ---');
            console.log('Params:', { funcionarioId, dataInicio, dataFim });

            if (!funcionarioId) {
                throw new Error('ID do funcionário é obrigatório.');
            }

            // funcionario_id is a UUID string, do not parse as Int
            const where = {
                funcionario_id: funcionarioId,
            };

            if (dataInicio && dataFim) {
                // Treats inputs as YYYY-MM-DD usually
                const start = new Date(dataInicio);
                const end = new Date(dataFim);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error('Datas inválidas.');
                }

                // Adjust to cover the full day range in local time (or UTC depending on server/client agreement)
                // Assuming dataInicio/dataFim are YYYY-MM-DD strings

                // Set start to beginning of the start day (00:00:00)
                // Note: creating new Date('YYYY-MM-DD') usually creates UTC 00:00
                // creating new Date(YYYY, MM, DD) creates Local 00:00

                // If the input is YYYY-MM-DD, parsing it directly often results in UTC midnight.
                // data_entrega is stored as DateTime (Timestamp).

                // We will use a safe range approach.
                // Start: dataInicio at 00:00:00.000
                const searchStart = new Date(dataInicio);
                searchStart.setUTCHours(0, 0, 0, 0); // Force UTC start if input is UTC date string

                // End: dataFim at 23:59:59.999
                const searchEnd = new Date(dataFim);
                searchEnd.setUTCHours(23, 59, 59, 999);

                // If the strings are coming from a local date picker, they might be "2024-12-19".
                // new Date("2024-12-19") -> 2024-12-19T00:00:00.000Z

                // Let's widen slightly if needed, but strict day range is usually preferred.
                // To be safe against timezone shifts (e.g. if db is stored in UTC but act in -3), 
                // typically we want to capture the whole absolute time range that covers the day.

                // Let's use the provided strings directly if possible, or stick to simple logic.
                // Better yet, let's just ensure we capture the full day for the provided dates.

                // Since there was a "hack" before (-1 day), maybe there's a timezone issue.
                // I'll stick to strict start/end of the day based on the input date values.

                // Fix: reset hours to ensure we get the full day bounds
                const s = new Date(dataInicio);
                s.setHours(0, 0, 0, 0);

                const e = new Date(dataFim);
                e.setHours(23, 59, 59, 999);

                where.data_entrega = {
                    gte: s,
                    lte: e
                };
                console.log('Filtro de Data Aplicado:', { gte: s, lte: e });
            }

            const results = await prisma.entregasEPI.findMany({
                where,
                include: {
                    epi: true,
                    usuario: { select: { nome: true } },
                    funcionario: {
                        select: {
                            nome_completo: true,
                            cpf: true,
                            cargo: {
                                select: { nome_cargo: true }
                            },
                            empresa: true
                        }
                    }
                },
                orderBy: { data_entrega: 'asc' }
            });
            console.log('Registros encontrados:', results.length);
            return results;
        } catch (error) {
            console.error('Erro em listarParaRelatorio:', error);
            throw error;
        }
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
