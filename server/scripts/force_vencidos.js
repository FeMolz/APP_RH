import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const currentDate = new Date();
  
  // Backdate all existing deliveries by 2 years to force them into a 'vencido' state
  const pastDate = new Date();
  pastDate.setFullYear(currentDate.getFullYear() - 2);

  const update = await prisma.entregaEPI.updateMany({
    data: {
      data_entrega: pastDate,
      data_vencimento: pastDate
    }
  });

  console.log(`Atualizadas ${update.count} entregas antigas para forcar estado 'VENCIDO'.`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
