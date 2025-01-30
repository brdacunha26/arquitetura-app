import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, RolePermissions } from '@/config/roles';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const userToken = request.cookies.get('user')?.value;
    if (!userToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = JSON.parse(userToken);
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Receber as novas permissões
    const { permissions } = await request.json();

    // Validar as permissões recebidas
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Permissões inválidas' }, { status: 400 });
    }

    // Salvar permissões no banco de dados
    const updatedRoles = await Promise.all(
      (Object.keys(permissions) as Role[]).map(async (role) => {
        return prisma.role.upsert({
          where: { name: role },
          update: { 
            permissions: JSON.stringify(permissions[role]) 
          },
          create: { 
            name: role, 
            permissions: JSON.stringify(permissions[role]) 
          }
        });
      })
    );

    return NextResponse.json({ 
      message: 'Permissões salvas com sucesso', 
      roles: updatedRoles 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar permissões:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const userToken = request.cookies.get('user')?.value;
    if (!userToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = JSON.parse(userToken);
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar permissões salvas no banco de dados
    const roles = await prisma.role.findMany();

    // Transformar permissões de volta para o formato original
    const parsedRoles = roles.reduce((acc, role) => {
      acc[role.name as Role] = JSON.parse(role.permissions);
      return acc;
    }, {} as Record<Role, RolePermissions>);

    return NextResponse.json(parsedRoles, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 