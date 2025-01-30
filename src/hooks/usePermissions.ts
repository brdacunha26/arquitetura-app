import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ROLE_PERMISSIONS, Role, RolePermissions } from '@/config/roles';

export function usePermissions() {
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const user = JSON.parse(userCookie);
      const userRole: Role = user.role || 'USER';
      setPermissions(ROLE_PERMISSIONS[userRole]);
    }
  }, []);

  const checkPermission = (
    section: keyof RolePermissions, 
    action?: keyof RolePermissions['projects']
  ) => {
    if (!permissions) return false;

    if (action) {
      return permissions[section][action as keyof RolePermissions['projects']];
    }
    
    return permissions[section];
  };

  return { 
    permissions, 
    checkPermission 
  };
} 