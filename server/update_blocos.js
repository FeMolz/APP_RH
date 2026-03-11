import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const quesitosSemBloco = await prisma.quesito.findMany({
    where: {
      bloco: null,
    },
  });

  if (quesitosSemBloco.length > 0) {
    console.log(`Encontrados ${quesitosSemBloco.length} quesitos com bloco nulo. Atualizando...`);
    await prisma.quesito.updateMany({
      where: {
        bloco: null,
      },
      data: {
        bloco: "Sem Bloco",
      },
    });
    console.log('Quesitos atualizados.');
  } else {
    console.log('Nenhum quesito com bloco nulo encontrado.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
