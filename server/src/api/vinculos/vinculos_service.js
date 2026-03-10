import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCargoVinculos = async (cargoId) => {
    const epis = await prisma.ePIsEmCargo.findMany({
        where: { cargo_id: cargoId },
        select: { epi_id: true }
    });

    const quesitos = await prisma.quesitosEmCargo.findMany({
        where: { cargo_id: cargoId },
        select: { quesito_id: true }
    });

    return {
        epi_ids: epis.map(e => e.epi_id),
        quesito_ids: quesitos.map(q => q.quesito_id)
    };
};

export const updateVinculos = async (cargoId, tipo, ids) => {
    if (tipo === 'epi') {
        await prisma.$transaction([
            prisma.ePIsEmCargo.deleteMany({ where: { cargo_id: cargoId } }),
            prisma.ePIsEmCargo.createMany({
                data: ids.map(id => ({ cargo_id: cargoId, epi_id: id }))
            })
        ]);
    } else if (tipo === 'quesito') {
        await prisma.$transaction([
            prisma.quesitosEmCargo.deleteMany({ where: { cargo_id: cargoId } }),
            prisma.quesitosEmCargo.createMany({
                data: ids.map(id => ({ cargo_id: cargoId, quesito_id: id }))
            })
        ]);
    } else {
        throw new Error('Tipo de vínculo inválido');
    }
};
