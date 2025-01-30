import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Log para depuração
    console.log('Tentativa de login:', { email });

    // Buscar usuário
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true
      }
    });

    // Log de usuário encontrado
    console.log('Usuário encontrado:', user);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Comparação de senha (em desenvolvimento)
    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // Remover senha antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    // Criar resposta com cookie
    const response = NextResponse.json(userWithoutPassword, { status: 200 });

    // Definir cookie com informações do usuário
    response.cookies.set({
      name: 'user',
      value: JSON.stringify(userWithoutPassword),
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 