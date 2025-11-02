import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authService = {
    register: async (dados) => {
        const { nome, email, senha, role } = dados;

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha_hash: senhaHash,
                role,
            },

            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                criado_em: true
            }
        });
        
        return novoUsuario;
    },

    login: async (dados) => {
        const { email, senha } = dados;

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            throw new Error("Email ou senha inválidos.");
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            throw new Error("Email ou senha inválidos.");
        }

        const tokenPayload = {
            id: usuario.id,
            role: usuario.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            }
        };
    }
};