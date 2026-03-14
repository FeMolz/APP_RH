import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDB() {
  console.log('Limpando dados antigos de teste (Cargos, Funcionarios, EPIs, Formacoes, Usuarios)...');
  await prisma.formacao.deleteMany();
  await prisma.funcionario.deleteMany();
  await prisma.ePIsEmCargo.deleteMany();
  await prisma.quesitosEmCargo.deleteMany();
  await prisma.ePI.deleteMany();
  await prisma.cargo.deleteMany();
  
  // Deletar usuários de teste (exceto admin)
  await prisma.usuario.deleteMany({
      where: { email: { not: 'admin@apprh.com' } }
  });
}

async function seed() {
  await cleanDB();
  console.log('Iniciando o Seed de Banco de Dados...');

  const senhaHash = await bcrypt.hash('senha123', 10);

  // 1. CARGOS
  const cargosData = ['Pedreiro', 'Eletricista', 'Mestre de Obras', 'Engenheiro Civil', 'Auxiliar Administrativo'];
  const cargosCriados = [];

  for (const nome of cargosData) {
    const cargo = await prisma.cargo.create({
      data: {
        nome_cargo: nome,
        descricao: `Descrição padrão para ${nome}`
      }
    });
    cargosCriados.push(cargo);
  }
  console.log(`✅ ${cargosCriados.length} Cargos criados.`);

  // 2. EPIS
  const episCriados = [];
  for (let i = 1; i <= 30; i++) {
    const isento = i % 5 === 0;
    const isVencido = i % 7 === 0;
    const epi = await prisma.ePI.create({
      data: {
        nome_epi: `EPI Teste ${i} ${isento ? '(Isento)' : ''}`,
        ca_numero: isento ? null : `CA-${Math.floor(Math.random() * 90000) + 10000}`,
        validade_ca: isento ? null : new Date(new Date().setFullYear(new Date().getFullYear() + (isVencido ? -1 : 1))),
        isento,
        descricao: `EPI gerado autómaticamente para testes número ${i}`,
      }
    });
    episCriados.push(epi);
  }
  console.log(`✅ ${episCriados.length} EPIs criados.`);

  // 2.1 Vincular EPIs a Cargos (Aleatoriamente)
  for (const cargo of cargosCriados) {
     const qtdEpis = Math.floor(Math.random() * 5) + 2; // de 2 a 6 epis por cargo
     const episShuffle = episCriados.sort(() => 0.5 - Math.random()).slice(0, qtdEpis);
     
     for (const epi of episShuffle) {
         await prisma.ePIsEmCargo.create({
             data: {
                 cargo_id: cargo.id,
                 epi_id: epi.id
             }
         });
     }
  }

  // 3. FUNCIONARIOS & USUARIOS & FORMACOES
  const empresas = ['CVF Incorporadora', 'Ligasul', 'Vivant'];
  const setores = ['Obras', 'Administrativo', 'Engenharia', 'Segurança do Trabalho'];
  
  for (let i = 1; i <= 20; i++) {
    const cargoAleatorio = cargosCriados[Math.floor(Math.random() * cargosCriados.length)];
    const emailAcesso = `teste${i}@apprh.com`;

    // Criar acesso de login
    await prisma.usuario.create({
      data: {
        nome: `Funcionário Teste ${i}`,
        email: emailAcesso,
        senha_hash: senhaHash,
        role: i <= 3 ? 'ADMIN' : 'TECNICO',
      }
    });

    // Criar Funcionario
    const statusAtivo = i % 4 !== 0; // 75% ativos, 25% inativos
    const admissao = new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(Math.random() * 5)));
    
    const funcionario = await prisma.funcionario.create({
        data: {
            nome_completo: `Funcionário Operacional Teste ${i}`,
            cpf: `${Math.floor(Math.random() * 900000000) + 100000000}-${Math.floor(Math.random() * 90) + 10}`,
            data_nascimento: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1),
            data_admissao: admissao,
            data_desligamento: statusAtivo ? null : new Date(),
            ativo: statusAtivo,
            empresa: empresas[Math.floor(Math.random() * empresas.length)],
            setor: setores[Math.floor(Math.random() * setores.length)],
            step: `Step-${Math.floor(Math.random() * 5) + 1}`,
            cargo_id: cargoAleatorio.id
        }
    });

    // Vincular Formações (Pelo menos 1 para cada Funcionario ativo)
    if(statusAtivo) {
        await prisma.formacao.create({
            data: {
                nome_formacao: `Treinamento Obrigatório NR-${Math.floor(Math.random() * 30)}`,
                instituicao: 'SENAI',
                nivel: 'Técnico',
                data_inicio: new Date(admissao.getTime() + 86400000), // 1 dia dps da admsisao
                data_conclusao: new Date(admissao.getTime() + (86400000 * 5)), // 5 dia dps
                funcionario_id: funcionario.id
            }
        });
    }
  }
  console.log(`✅ 20 Funcionários e Usuários criados com as respectivas formações.`);

  console.log('🎉 Seed completo!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
