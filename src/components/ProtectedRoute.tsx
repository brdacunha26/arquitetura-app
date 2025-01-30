'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import Cookies from 'js-cookie';
import { 
  Box, 
  Typography, 
  Container,
  CircularProgress
} from '@mui/material';

console.warn('ProtectedRoute: Módulo carregado'); // Log global

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: 'projects' | 'tasks' | 'team' | 'finance';
    action: string;
  };
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission 
}: ProtectedRouteProps) {
  console.warn('ProtectedRoute: Componente renderizado'); // Log de renderização

  const router = useRouter();
  const pathname = usePathname();
  const { can } = usePermission();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se estiver na página de login, renderiza normalmente
    if (pathname === '/login') {
      setIsLoading(false);
      return;
    }

    // Verifica autenticação
    const userCookie = Cookies.get('user');
    console.log('Cookie do usuário:', userCookie);

    if (!userCookie) {
      console.log('Redirecionando para login - sem cookie');
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userCookie);
      console.log('Usuário autenticado:', user);

      // Verifica permissões se necessário
      if (requiredPermission) {
        const hasPermission = can(
          requiredPermission.resource, 
          requiredPermission.action
        );
        console.log('Verificação de permissão:', {
          resource: requiredPermission.resource,
          action: requiredPermission.action,
          hasPermission
        });

        if (!hasPermission) {
          console.log('Redirecionando - sem permissão');
          router.push('/acesso-negado');
          return;
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/login');
    }
  }, [pathname, can, requiredPermission, router]);

  if (isLoading) {
    console.warn('ProtectedRoute: Renderizando tela de carregamento');
    return (
      <Container 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Container>
    );
  }

  console.warn('ProtectedRoute: Renderizando children');
  return <>{children}</>;
} 