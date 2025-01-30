'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  ListItemSecondaryAction,
  TableCell,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  MonetizationOn as MonetizationOnIcon,
  Group as TeamIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Assignment as TaskIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  FilePresent as FileIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Undo as UndoIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  Payment as PaymentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useFinanceContext } from '../contexts/FinanceContext';
import { useProjectFinances } from '@/hooks/useProjectFinances';
import { useTeamContext } from '@/contexts/TeamContext';
import { useTasks } from '../contexts/TaskContext';
import { useProjects } from '../contexts/ProjectContext';
import { ptBR } from 'date-fns/locale';
import { statusLabels, statusColors } from '@/contexts/TaskContext';
import { NumericFormat } from 'react-number-format';
import { projectStatusLabels, projectStatusColors } from '@/contexts/ProjectContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  budget: number;
  status: string;
  paymentMethod: 'pix' | 'cartao';
  installmentCount: number;
  endDate: string;
}

interface ProjectDetailsProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

// Dados de exemplo para demonstração
const mockTeamMembers = [
  { id: '1', name: 'Ana Silva', role: 'Arquiteta', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Carlos Santos', role: 'Designer', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Maria Costa', role: 'Engenheira', status: 'ON_VACATION', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const mockFiles = [
  { id: '1', name: 'Planta Baixa.pdf', type: 'PDF', size: '2.5 MB' },
  { id: '2', name: 'Render 3D.jpg', type: 'IMAGE', size: '15 MB' },
  { id: '3', name: 'Memorial.doc', type: 'DOC', size: '1.2 MB' },
];

// Atualizar os dados mock para incluir as transações financeiras
const mockFinancialTransactions = [
  { 
    id: '1', 
    date: '2024-03-01', 
    description: 'Pagamento Inicial', 
    value: 5000, 
    type: 'entrada',
    editHistory: [
      { date: '2024-03-02', description: 'Valor corrigido de R$ 4500 para R$ 5000', editor: 'Ana Silva' }
    ]
  },
  { 
    id: '2', 
    date: '2024-03-15', 
    description: 'Compra de Licenças', 
    value: -800, 
    type: 'saída',
    editHistory: []
  },
  { 
    id: '3', 
    date: '2024-04-01', 
    description: 'Segunda Parcela', 
    value: 5000, 
    type: 'entrada',
    editHistory: [
      { date: '2024-04-02', description: 'Descrição alterada de "Parcela 2" para "Segunda Parcela"', editor: 'Carlos Santos' },
      { date: '2024-04-03', description: 'Data alterada de 31/03 para 01/04', editor: 'Ana Silva' }
    ]
  },
];

// Novos dados mock para roles
const mockRoles = [
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'Designer UX/UI',
  'Gerente de Projeto',
  'QA',
];

// Dados mock de funcionários disponíveis
const mockAvailableEmployees = [
  { id: 4, name: 'Pedro Oliveira', role: 'Desenvolvedor Frontend', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Julia Lima', role: 'Designer UX/UI', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Roberto Souza', role: 'Desenvolvedor Backend', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, name: 'Fernanda Santos', role: 'QA', avatar: 'https://i.pravatar.cc/150?img=7' },
];

// Atualizar interface para parcelas
interface Installment {
  number: number;
  dueDate: string;
  value: number;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Atualizar interface BudgetInfo
interface BudgetInfo {
  totalValue: number;
  paymentMethod: 'vista' | 'parcelado';
  installmentCount: number;
  installmentDates: string[];
  installmentsList: Installment[];
}

// Dados mock para etapas do projeto
const mockProjectSteps = [
  {
    id: 1,
    title: 'Briefing Inicial',
    description: 'Reunião com o cliente para entender necessidades, preferências e expectativas do projeto',
    status: 'COMPLETED',
    deadline: '2024-03-15',
    completedAt: '2024-03-14',
  },
  {
    id: 2,
    title: 'Medição do Espaço',
    description: 'Levantamento das medidas e condições do local do projeto',
    status: 'IN_PROGRESS',
    deadline: '2024-03-20',
    completedAt: null,
  },
  {
    id: 3,
    title: 'Estudo Preliminar',
    description: 'Desenvolvimento do conceito inicial, zoneamento e estudos de layout',
    status: 'PENDING',
    deadline: '2024-04-01',
    completedAt: null,
  },
  {
    id: 4,
    title: 'Anteprojeto',
    description: 'Desenvolvimento detalhado do projeto com plantas, cortes e vistas principais',
    status: 'PENDING',
    deadline: '2024-04-15',
    completedAt: null,
  },
  {
    id: 5,
    title: 'Projeto Executivo',
    description: 'Detalhamento técnico completo, incluindo especificações de materiais e acabamentos',
    status: 'PENDING',
    deadline: '2024-05-01',
    completedAt: null,
  },
  {
    id: 6,
    title: 'Projeto 3D',
    description: 'Renderização das imagens em 3D para visualização realista do projeto',
    status: 'PENDING',
    deadline: '2024-05-15',
    completedAt: null,
  },
  {
    id: 7,
    title: 'Memorial Descritivo',
    description: 'Documentação detalhada com especificações técnicas e lista de materiais',
    status: 'PENDING',
    deadline: '2024-05-20',
    completedAt: null,
  },
  {
    id: 8,
    title: 'Aprovação do Cliente',
    description: 'Apresentação final do projeto ao cliente para aprovação',
    status: 'PENDING',
    deadline: '2024-05-25',
    completedAt: null,
  },
  {
    id: 9,
    title: 'Aprovações Legais',
    description: 'Submissão e acompanhamento das aprovações necessárias (se aplicável)',
    status: 'PENDING',
    deadline: '2024-06-15',
    completedAt: null,
  },
  {
    id: 10,
    title: 'Acompanhamento de Obra',
    description: 'Visitas técnicas para acompanhamento da execução do projeto',
    status: 'PENDING',
    deadline: '2024-07-30',
    completedAt: null,
  }
];

// Atualizar o diálogo de adicionar etapa para incluir etapas comuns
const commonSteps = [
  'Briefing Inicial',
  'Medição do Espaço',
  'Estudo Preliminar',
  'Anteprojeto',
  'Projeto Executivo',
  'Projeto 3D',
  'Memorial Descritivo',
  'Aprovação do Cliente',
  'Aprovações Legais',
  'Acompanhamento de Obra',
  'Detalhamento de Mobiliário',
  'Projeto Luminotécnico',
  'Projeto Hidráulico',
  'Projeto Elétrico',
];

// Adicionar dados mock para eventos da linha do tempo
const mockTimelineEvents = [
  {
    id: '1',
    type: 'TASK',
    title: 'Início do Projeto',
    description: 'Kickoff realizado com o cliente',
    date: new Date(),
  },
  {
    id: '2',
    type: 'DOCUMENT',
    title: 'Documentação Inicial',
    description: 'Upload da planta baixa',
    date: new Date(),
  },
];

// Atualizar a interface do passo do projeto para incluir o id
interface ProjectStep {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string;
  completedAt: string | null;
  assignedTo?: string;
}

const initialStepFormData = {
  id: 0,
  title: '',
  description: '',
  deadline: format(new Date(), 'yyyy-MM-dd'),
  status: 'PENDING' as const,
  completedAt: null,
  assignedTo: null as string | null,
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
};

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para determinar o status da parcela
const getInstallmentStatus = (installmentDate: Date, transaction: any) => {
  const today = new Date();
  
  if (transaction?.status === 'COMPLETED') {
    return 'COMPLETED';
  }
  
  return installmentDate < today ? 'OVERDUE' : 'PENDING';
};

// Função para obter o label do status
const getStatusLabel = (status?: string) => {
  console.log('Status recebido:', status);
  console.log('Labels disponíveis:', projectStatusLabels);
  if (!status || !projectStatusLabels[status]) {
    return 'Status Não Definido';
  }
  return projectStatusLabels[status];
};

// Função para obter a cor do status
const getStatusColor = (status?: string) => {
  console.log('Status para cor:', status);
  console.log('Cores disponíveis:', projectStatusColors);
  if (!status || !projectStatusColors[status]) {
    return {
      main: '#9e9e9e', // cor neutra
      contrastText: '#ffffff'
    };
  }
  return {
    main: projectStatusColors[status],
    contrastText: '#ffffff'
  };
};

export default function ProjectDetails({ open, onClose, project }: ProjectDetailsProps) {
  console.log('Projeto recebido:', project);
  console.log('Status do projeto:', project.status);
  console.log('Status labels:', projectStatusLabels);
  console.log('Status colors:', projectStatusColors);
  const [value, setValue] = useState(0);
  const { transactions, setTransactions } = useFinanceContext();
  const { financialSummary, paymentAlerts } = useProjectFinances(project.id);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<null | typeof mockTeamMembers[0]>(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // Adicionar estado para eventos
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Estados para os formulários
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    role: '',
    status: 'ACTIVE',
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    deadline: new Date().toISOString().split('T')[0],
    assignedTo: '',
    projectId: project.id,
  });

  const [transactionFormData, setTransactionFormData] = useState({
    description: '',
    value: 0,
    type: 'entrada',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
  });

  const { members, addMember, updateMember } = useTeamContext();
  const { tasks, addTask, updateTask } = useTasks();
  const { projects } = useProjects();

  // Filtrar membros do projeto atual
  const projectMembers = useMemo(() => {
    return members.filter(member => member.projectId === project.id);
  }, [members, project.id]);

  // Filtrar transações do projeto atual
  const projectTransactions = useMemo(() => {
    return transactions.filter(t => t.project === project.title);
  }, [transactions, project.title]);

  // Filtrar tarefas do projeto atual
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.project === project.title);
  }, [tasks, project.title]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMarkAsPaid = (installment: any) => {
    const existingTransaction = projectTransactions.find(t => 
      t.project === project.title && 
      t.type === 'entrada' && 
      t.installmentNumber === installment.number
    );

    if (existingTransaction) {
      setTransactions(prev => prev.map(t => 
        t.id === existingTransaction.id 
          ? { 
              ...t, 
              status: 'COMPLETED',
              paidAt: new Date().toISOString().split('T')[0]
            } 
          : t
      ));
    } else {
      const newTransaction = {
        id: crypto.randomUUID(),
        project: project.title,
        description: `${installment.number}ª Parcela`,
        value: installment.value,
        type: 'entrada',
        status: 'COMPLETED',
        date: new Date().toISOString().split('T')[0],
        paidAt: new Date().toISOString().split('T')[0],
        installmentNumber: installment.number
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const handleRevertPayment = (installment: any) => {
    const transaction = transactions.find(t => 
      t.project === project.title && 
      t.type === 'entrada' && 
      t.installmentNumber === installment.number
    );

    if (transaction) {
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id 
          ? { 
              ...t, 
              status: 'PENDING' as const,
              paidAt: undefined
            } 
          : t
      ));
    }
  };

  // Funções de manipulação da equipe
  const handleAddMember = () => {
    setIsAddMemberDialogOpen(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setMemberFormData({
      name: member.name,
      role: member.role,
      status: member.status,
    });
    setIsAddMemberDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (selectedMember) {
      const changes = [];
      if (selectedMember.name !== memberFormData.name) {
        changes.push(`nome alterado de "${selectedMember.name}" para "${memberFormData.name}"`);
      }
      if (selectedMember.role !== memberFormData.role) {
        changes.push(`função alterada de "${selectedMember.role}" para "${memberFormData.role}"`);
      }
      if (selectedMember.status !== memberFormData.status) {
        const oldStatus = selectedMember.status === 'ACTIVE' ? 'Ativo' : 'Em Férias';
        const newStatus = memberFormData.status === 'ACTIVE' ? 'Ativo' : 'Em Férias';
        changes.push(`status alterado de "${oldStatus}" para "${newStatus}"`);
      }

      updateMember({
        ...selectedMember,
        name: memberFormData.name,
        role: memberFormData.role,
        status: memberFormData.status,
        projectId: project.id
      });
    } else {
      addMember({
        id: crypto.randomUUID(),
        name: memberFormData.name,
        role: memberFormData.role,
        status: memberFormData.status,
        projectId: project.id,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      });
    }
    setIsAddMemberDialogOpen(false);
    setSelectedMember(null);
    setMemberFormData({
      name: '',
      role: '',
      status: 'ACTIVE'
    });
  };

  // Funções de manipulação de arquivos
  const handleUploadFile = () => {
    setIsUploadDialogOpen(true);
  };

  const handleDownloadFile = (file: typeof mockFiles[0]) => {
    // Implementar lógica de download
    console.log('Downloading file:', file.name);
  };

  // Funções de manipulação de eventos
  const handleAddEvent = () => {
    setIsAddEventDialogOpen(true);
  };

  const handleSaveEvent = () => {
    // Implementar lógica de salvar evento
    setIsAddEventDialogOpen(false);
  };

  // Handlers para tarefas
  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      assignedTo: task.assignedTo,
      projectId: task.projectId,
    });
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (selectedTask) {
      const changes = [];
      if (selectedTask.title !== taskFormData.title) {
        changes.push(`título alterado de "${selectedTask.title}" para "${taskFormData.title}"`);
      }
      if (selectedTask.status !== taskFormData.status) {
        changes.push(`status alterado de "${statusLabels[selectedTask.status]}" para "${statusLabels[taskFormData.status]}"`);
      }
      if (selectedTask.deadline !== taskFormData.deadline) {
        changes.push(`prazo alterado de "${formatDate(selectedTask.deadline)}" para "${formatDate(taskFormData.deadline)}"`);
      }
      if (selectedTask.assignedTo !== taskFormData.assignedTo) {
        const oldMember = members.find(m => m.id === selectedTask.assignedTo)?.name || 'Não atribuído';
        const newMember = members.find(m => m.id === taskFormData.assignedTo)?.name || 'Não atribuído';
        changes.push(`responsável alterado de "${oldMember}" para "${newMember}"`);
      }

      updateTask({
        ...selectedTask,
        ...taskFormData,
      });
    } else {
      addTask({
        id: crypto.randomUUID(),
        project: project.title,
        projectId: project.id,
        ...taskFormData,
      });
    }
    setIsAddTaskDialogOpen(false);
    setSelectedTask(null);
    setTaskFormData({
      title: '',
      description: '',
      status: 'PENDING',
      deadline: new Date().toISOString().split('T')[0],
      assignedTo: '',
      projectId: project.id,
    });
  };

  // Handlers para transações
  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setTransactionFormData({
      description: transaction.description,
      value: transaction.value,
      type: transaction.type,
      date: transaction.date,
      status: transaction.status || 'PENDING',
    });
    setIsAddTransactionDialogOpen(true);
  };

  const handleSaveTransaction = () => {
    if (selectedTransaction) {
      const changes = [];
      if (selectedTransaction.description !== transactionFormData.description) {
        changes.push(`descrição alterada de "${selectedTransaction.description}" para "${transactionFormData.description}"`);
      }
      if (selectedTransaction.value !== transactionFormData.value) {
        changes.push(`valor alterado de ${formatCurrency(selectedTransaction.value)} para ${formatCurrency(transactionFormData.value)}`);
      }
      if (selectedTransaction.type !== transactionFormData.type) {
        changes.push(`tipo alterado de "${selectedTransaction.type}" para "${transactionFormData.type}"`);
      }
      if (selectedTransaction.date !== transactionFormData.date) {
        changes.push(`data alterada de "${formatDate(selectedTransaction.date)}" para "${formatDate(transactionFormData.date)}"`);
      }
      if (selectedTransaction.status !== transactionFormData.status) {
        const oldStatus = selectedTransaction.status === 'COMPLETED' ? 'Concluído' : 'Pendente';
        const newStatus = transactionFormData.status === 'COMPLETED' ? 'Concluído' : 'Pendente';
        changes.push(`status alterado de "${oldStatus}" para "${newStatus}"`);
      }

      setTransactions(prev => prev.map(t => 
        t.id === selectedTransaction.id ? { ...t, ...transactionFormData } : t
      ));
    } else {
      setTransactions(prev => [...prev, {
        id: crypto.randomUUID(),
        project: project.title,
        projectId: project.id,
        ...transactionFormData,
      }]);
    }
    setIsAddTransactionDialogOpen(false);
    setSelectedTransaction(null);
    setTransactionFormData({
      description: '',
      value: 0,
      type: 'entrada',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    });
  };

  // Atualizar a função de excluir transação
  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }
  };

  // Atualizar o cálculo do resumo financeiro
  const calculateFinancialSummary = () => {
    const today = new Date();
    let totalReceived = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    // Valor de cada parcela
    const installmentValue = project.budget / project.installmentCount;

    // Calcular os totais baseado nas parcelas e suas transações
    Array.from({ length: project.installmentCount }).forEach((_, index) => {
      const installmentDate = new Date(project.endDate);
      installmentDate.setMonth(installmentDate.getMonth() + index);

      const transaction = projectTransactions.find(t => 
        t.type === 'entrada' && 
        t.installmentNumber === index + 1
      );

      const status = getInstallmentStatus(installmentDate, transaction);

      switch (status) {
        case 'COMPLETED':
          totalReceived += installmentValue;
          break;
        case 'PENDING':
          totalPending += installmentValue;
          break;
        case 'OVERDUE':
          totalOverdue += installmentValue;
          break;
      }
    });

    return {
      totalReceived,
      totalPending,
      totalOverdue
    };
  };

  // Usar o novo cálculo no lugar do financialSummary do hook
  const summary = calculateFinancialSummary();

  // Renderização da aba de Tarefas
  const renderTasksTab = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Tarefas do Projeto
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            Nova Tarefa
          </Button>
        </Box>
        <List>
          {projectTasks.map((task) => {
            const responsibleMember = members.find(m => m.id === task.assignedTo);
            return (
              <ListItem
                key={task.id}
                sx={{
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={statusLabels[task.status]}
                          color={statusColors[task.status]}
                        />
                        <Chip
                          size="small"
                          label={`Prazo: ${formatDate(task.deadline)}`}
                          icon={<ScheduleIcon />}
                        />
                        <Chip
                          size="small"
                          label={`Responsável: ${responsibleMember?.name || 'Não atribuído'}`}
                          icon={<TeamIcon />}
                        />
                      </Box>
                    </Box>
                  }
                />
                <IconButton onClick={() => handleEditTask(task)}>
                  <EditIcon />
                </IconButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  };

  // Renderização da aba de Equipe
  const renderTeamTab = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Equipe do Projeto
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setIsAddMemberDialogOpen(true)}
          >
            Adicionar Membro
          </Button>
        </Box>
        <Grid container spacing={2}>
          {projectMembers.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={member.avatar} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">{member.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  size="small"
                  label={member.status === 'ACTIVE' ? 'Ativo' : 'Em Férias'}
                  color={member.status === 'ACTIVE' ? 'success' : 'warning'}
                  sx={{ width: '100%' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Renderização da aba Financeira
  const renderFinanceTab = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Financeiro
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setIsAddTransactionDialogOpen(true)}
          >
            Nova Transação
          </Button>
        </Box>
        
        {/* Cards do Resumo Financeiro */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle2">Orçamento Total</Typography>
              <Typography variant="h6">
                {formatCurrency(project.budget)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle2">Recebido</Typography>
              <Typography variant="h6">
                {formatCurrency(summary.totalReceived)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2">A Receber</Typography>
              <Typography variant="h6">
                {formatCurrency(summary.totalPending)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="subtitle2">Atrasado</Typography>
              <Typography variant="h6">
                {formatCurrency(summary.totalOverdue)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Lista de Parcelas */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Parcelas
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parcela</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data Pagamento</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: project.installmentCount }, (_, index) => {
                const installmentValue = project.budget / project.installmentCount;
                const installmentDate = new Date(project.endDate);
                installmentDate.setMonth(installmentDate.getMonth() + index);
                
                const transaction = projectTransactions.find(t => 
                  t.type === 'entrada' && 
                  t.installmentNumber === index + 1
                );

                const status = getInstallmentStatus(installmentDate, transaction);

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}ª Parcela</TableCell>
                    <TableCell>{formatCurrency(installmentValue)}</TableCell>
                    <TableCell>{formatDate(installmentDate.toISOString())}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(status)}
                        color={getStatusColor(status)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(transaction?.paidAt)}</TableCell>
                    <TableCell>
                      {status !== 'COMPLETED' ? (
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleMarkAsPaid({ number: index + 1, value: installmentValue })}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          color="warning" 
                          onClick={() => handleRevertPayment({ number: index + 1 })}
                        >
                          <UndoIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Lista de Transações */}
        <TableContainer component={Paper}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Transações
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right" sx={{
                    color: transaction.type === 'entrada' ? 'success.main' : 'error.main'
                  }}>
                    {formatCurrency(transaction.value)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={transaction.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                      color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleEditTransaction(transaction)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {project.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(project.status)}
                  sx={{
                    bgcolor: getStatusColor(project.status).main,
                    color: getStatusColor(project.status).contrastText,
                  }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  Cliente: {project.clientName || 'Não informado'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Informações do Projeto */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Descrição
                </Typography>
                <Typography variant="body1">
                  {project.description}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Informações
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography variant="body2">
                    <strong>Orçamento:</strong> {formatCurrency(project.budget)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Prazo:</strong> {formatDate(project.endDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Forma de Pagamento:</strong> {project.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                  </Typography>
                  {project.paymentMethod !== 'pix' && (
                    <Typography variant="body2">
                      <strong>Parcelas:</strong> {project.installmentCount}x
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Abas */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab icon={<TaskIcon />} label="Tarefas" {...a11yProps(0)} />
              <Tab icon={<TeamIcon />} label="Equipe" {...a11yProps(1)} />
              <Tab icon={<PaymentIcon />} label="Financeiro" {...a11yProps(2)} />
            </Tabs>
          </Box>

          {/* Conteúdo das Abas */}
          <TabPanel value={value} index={0}>
            {renderTasksTab()}
          </TabPanel>

          <TabPanel value={value} index={1}>
            {renderTeamTab()}
          </TabPanel>

          <TabPanel value={value} index={2}>
            {renderFinanceTab()}
          </TabPanel>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Adicionar/Editar Tarefa */}
      <Dialog
        open={isAddTaskDialogOpen}
        onClose={() => {
          setIsAddTaskDialogOpen(false);
          setSelectedTask(null);
          setTaskFormData({
            title: '',
            description: '',
            status: 'PENDING',
            deadline: new Date().toISOString().split('T')[0],
            assignedTo: '',
            projectId: project.id,
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título"
              value={taskFormData.title}
              onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={taskFormData.description}
              onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={taskFormData.status}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Data de Entrega"
              type="date"
              value={taskFormData.deadline}
              onChange={(e) => setTaskFormData(prev => ({ ...prev, deadline: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={taskFormData.assignedTo}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                label="Responsável"
              >
                <MenuItem value="">
                  <em>Não atribuído</em>
                </MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddTaskDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Adicionar/Editar Membro */}
      <Dialog
        open={isAddMemberDialogOpen}
        onClose={() => {
          setIsAddMemberDialogOpen(false);
          setSelectedMember(null);
          setMemberFormData({
            name: '',
            role: '',
            status: 'ACTIVE',
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedMember ? 'Editar Membro' : 'Adicionar Membro'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              value={memberFormData.name}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Função"
              value={memberFormData.role}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, role: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={memberFormData.status}
                onChange={(e) => setMemberFormData(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="ACTIVE">Ativo</MenuItem>
                <MenuItem value="ON_VACATION">Em Férias</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddMemberDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveMember} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Adicionar/Editar Transação */}
      <Dialog
        open={isAddTransactionDialogOpen}
        onClose={() => {
          setIsAddTransactionDialogOpen(false);
          setSelectedTransaction(null);
          setTransactionFormData({
            description: '',
            value: 0,
            type: 'entrada',
            date: new Date().toISOString().split('T')[0],
            status: 'PENDING',
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTransaction ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Descrição"
              value={transactionFormData.description}
              onChange={(e) => setTransactionFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
            />
            <NumericFormat
              customInput={TextField}
              label="Valor"
              value={transactionFormData.value}
              onValueChange={(values) => {
                const { floatValue } = values;
                setTransactionFormData(prev => ({ ...prev, value: floatValue || 0 }));
              }}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={transactionFormData.type}
                onChange={(e) => setTransactionFormData(prev => ({ ...prev, type: e.target.value }))}
                label="Tipo"
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saída">Saída</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data"
              type="date"
              value={transactionFormData.date}
              onChange={(e) => setTransactionFormData(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={transactionFormData.status}
                onChange={(e) => setTransactionFormData(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="COMPLETED">Concluído</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddTransactionDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveTransaction} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Upload de Arquivo */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload de Arquivo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Selecionar Arquivo
              <input
                type="file"
                hidden
                onChange={(e) => {
                  // Implementar lógica de upload
                  console.log('File selected:', e.target.files?.[0]);
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setIsUploadDialogOpen(false)}>Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 