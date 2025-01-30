export interface Project {
  id: string;
  title: string;
  description: string;
  client: string;
  budget: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  responsibleMember?: string;
  paymentMethod: 'vista' | 'parcelado';
  installmentCount: number;
  installments: Array<{
    id: string;
    number: number;
    dueDate: string;
    value: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paymentDate?: string;
  }>;
  files: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
  team: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
} 