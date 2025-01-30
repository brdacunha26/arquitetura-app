import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS, UserRole, USER_ROLES } from '@/hooks/usePermission';

// Mapeamento de usuários com permissões específicas
const USER_SPECIFIC_PERMISSIONS = {
  'aline@exemplo.com': {
    role: 'USER',
    permissions: {
      projects: ['view'],
      tasks: ['view', 'create'],
      team: [],
      finance: []
    }
  },
  // Adicione outros usuários com permissões personalizadas aqui
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  console.log('Buscando permissões para:', email);

  if (!email) {
    return NextResponse.json({ 
      error: 'Email não fornecido', 
      permissions: PERMISSIONS.USER 
    }, { status: 400 });
  }

  // Verificação de permissões específicas do usuário
  const userSpecificConfig = USER_SPECIFIC_PERMISSIONS[email as keyof typeof USER_SPECIFIC_PERMISSIONS];

  if (userSpecificConfig) {
    console.log('Permissões específicas encontradas para o usuário');
    return NextResponse.json({
      role: userSpecificConfig.role,
      permissions: userSpecificConfig.permissions
    });
  }

  // Caso não tenha configuração específica, retorna permissões padrão
  console.log('Usando permissões padrão');
  return NextResponse.json({
    role: 'USER',
    permissions: PERMISSIONS.USER
  });
} 