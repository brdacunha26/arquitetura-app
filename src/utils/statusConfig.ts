import {
  PendingOutlined as PendingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// Definindo as cores dos status
export const statusColors = {
  BUDGET_IN_PROGRESS: '#9c27b0', // roxo
  BUDGET_SENT: '#ff5722', // laranja
  BUDGET_APPROVED: '#795548', // marrom
  PENDING: '#ff9800', // amarelo
  IN_PROGRESS: '#2196f3', // azul
  COMPLETED: '#4caf50', // verde
};

// Mapeamento de ícones para cada status
export const statusIcons = {
  BUDGET_IN_PROGRESS: PendingIcon,
  BUDGET_SENT: ScheduleIcon,
  BUDGET_APPROVED: CheckCircleIcon,
  PENDING: PendingIcon,
  IN_PROGRESS: ScheduleIcon,
  COMPLETED: CheckCircleIcon,
}; 