import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const relatorioService = {
    criar: async (dados) => {
        const { funcionario_id, caminho_arquivo, entrega_ids } = dados;

        return await prisma.$transaction(async (tx) => {
            // 1. Create the report record
            const relatorio = await tx.relatorioEntrega.create({
                data: {
                    funcionario_id,
                    caminho_arquivo
                }
            });

            // 2. Update the deliveries to link to this report
            if (entrega_ids && entrega_ids.length > 0) {
                await tx.entregasEPI.updateMany({
                    where: {
                        id: {
                            in: entrega_ids
                        }
                    },
                    data: {
                        relatorio_id: relatorio.id
                    }
                });
            }

            return relatorio;
        });
    },

    listar: async () => {
        return await prisma.relatorioEntrega.findMany({
            include: {
                funcionario: true,
                entregas: {
                    include: {
                        epi: true
                    }
                }
            },
            orderBy: {
                data_geracao: 'desc'
            }
        });
    },

    buscarPorId: async (id) => {
        return await prisma.relatorioEntrega.findUnique({
            where: { id },
            include: {
                funcionario: true
            }
        });
    }
};

export default relatorioService;
