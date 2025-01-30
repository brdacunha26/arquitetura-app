export type Role = 'USER' | 'MANAGER' | 'ADMIN';

export interface RolePermissions {
  dashboard: boolean;
  projects: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  tasks: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  finance: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  USER: {
    dashboard: true,
    projects: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: false
    },
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false
    },
    finance: {
      view: false,
      create: false,
      edit: false,
      delete: false
    }
  },
  MANAGER: {
    dashboard: true,
    projects: {
      view: true,
      create: true,
      edit: true,
      delete: false
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    users: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    finance: {
      view: true,
      create: false,
      edit: false,
      delete: false
    }
  },
  ADMIN: {
    dashboard: true,
    projects: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    users: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    finance: {
      view: true,
      create: true,
      edit: true,
      delete: true
    }
  }
}; 