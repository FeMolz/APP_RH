import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('CHECK_START');
    if (!prisma.ePI) console.log('prisma.ePI is UNDEFINED');
    else console.log('prisma.ePI is DEFINED');

    if (!prisma.epi) console.log('prisma.epi is UNDEFINED');
    else console.log('prisma.epi is DEFINED');

    if (!prisma.EPI) console.log('prisma.EPI is UNDEFINED');
    else console.log('prisma.EPI is DEFINED');

    if (!prisma.entregasEPI) console.log('prisma.entregasEPI is UNDEFINED');
    else console.log('prisma.entregasEPI is DEFINED');

    if (!prisma.EntregasEPI) console.log('prisma.EntregasEPI is UNDEFINED');
    else console.log('prisma.EntregasEPI is DEFINED');
    console.log('CHECK_END');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
