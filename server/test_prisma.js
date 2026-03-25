import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    const entregas = await prisma.entregaEPI.findMany({
       take: 5,
       orderBy: { data_entrega: 'desc' }
    });
    for(const e of entregas) {
        console.log("ID:", e.id);
        console.log("Data:", e.data_entrega.toISOString());
        console.log("Local:", e.data_entrega.toString());
    }
}
test().catch(console.error).finally(()=>prisma.$disconnect());
