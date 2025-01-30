'use client';

import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER'
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const PERMISSIONS = {
  ADMIN: {
    projects: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    team: ['view', 'create', 'edit', 'delete'],
    finance: ['view', 'create', 'edit', 'delete']
  },
  MANAGER: {
    projects: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    team: ['view'],
    finance: ['view']
  },
  USER: {
    projects: ['view'],
    tasks: ['view', 'create', 'edit'],
    team: [],
    finance: []
  }
};

export function usePermission() {
  const [userPermissions, setUserPermissions] = useState(PERMISSIONS.USER);
  const [role, setRole] = useState<UserRole>('USER');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
        
        // Definir papel padrão como USER se não estiver especificado
        const userRole = parsedUser.role || 'USER';
        setRole(userRole);

        // Definir permissões padrão baseadas no papel
        const defaultPermissions = PERMISSIONS[userRole as UserRole] || PERMISSIONS.USER;
        setUserPermissions(defaultPermissions);

        // Buscar permissões personalizadas
        const fetchUserPermissions = async () => {
          try {
            const response = await fetch(`/api/user-permissions?email=${parsedUser.email}`);
            if (response.ok) {
              const data = await response.json();
              setUserPermissions(data.permissions);
              setRole(data.role);
            }
          } catch (error) {
            console.error('Erro ao buscar permissões:', error);
          }
        };

        fetchUserPermissions();
      } catch (error) {
        console.error('Erro ao parsear cookie de usuário:', error);
        // Definir permissões padrão em caso de erro
        setUserPermissions(PERMISSIONS.USER);
        setRole('USER');
      }
    }
  }, []);

  const checkPermission = (
    resource: keyof typeof PERMISSIONS[UserRole], 
    action: string
  ) => {
    // Log para depuração
    console.log('Verificando permissão:', {
      resource, 
      action, 
      role, 
      permissions: userPermissions
    });

    // Verificação rigorosa de permissões
    const hasPermission = userPermissions[resource]?.includes(action) || false;
    
    console.log('Resultado da verificação:', hasPermission);
    
    return hasPermission;
  };

  return {
    role,
    can: checkPermission,
    user
  };
} 