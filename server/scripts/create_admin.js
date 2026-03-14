import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@apprh.com';
    const senha = 'admin';
    const nome = 'Administrador do Sistema';

    console.log('Verificando se o usuário já existe...');

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`O usuário com e-mail ${email} já está cadastrado.`);
      if (existingUser.role !== 'ADMIN') {
         console.log('Atualizando role para ADMIN...');
         await prisma.usuario.update({
             where: { email },
             data: { role: 'ADMIN' }
         });
         console.log('Role atualizada para ADMIN com sucesso.');
      }
      return;
    }

    console.log('Criando novo usuário administrador...');
    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash: senhaHash,
        role: 'ADMIN',
        ativo: true
      }
    });

    console.log('====================================');
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${senha}`);
    console.log('====================================');

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
