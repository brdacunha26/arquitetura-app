'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { redirect } from 'next/navigation';

interface PermissionGateProps {
  resource: 'projects' | 'tasks' | 'team' | 'finance';
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  resource, 
  action, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { can, role } = usePermission();

  console.log('Verificação de Permissão:', {
    resource,
    action,
    role,
    hasPermission: can(resource, action)
  });

  if (!can(resource, action)) {
    // Se não tiver permissão, mostra fallback ou redireciona
    if (fallback) return fallback as ReactNode;
    
    // Redireciona para página de acesso negado
    redirect('/acesso-negado');
  }

  return <>{children}</>;
} 