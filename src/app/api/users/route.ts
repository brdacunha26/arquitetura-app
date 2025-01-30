import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
    }

    // Criar novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Em produção, use hash
        role: role || 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, password, role } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Preparar dados para atualização
    const updateData: any = { name, role };
    
    // Atualizar email se fornecido
    if (email) {
      const existingUser = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
      });
      
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
      }
      
      updateData.email = email;
    }

    // Atualizar senha se fornecida
    if (password) {
      updateData.password = password; // Em produção, use hash
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: 'Usuário excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 