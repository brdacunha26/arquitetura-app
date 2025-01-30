'use client';

import React, { useState, useMemo } from 'react';
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
  Assignment as StepsIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  FilePresent as FileIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { format } from 'date-fns';
import { useFinanceContext } from '../contexts/FinanceContext';

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

// Adicionar interface para parcelas
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
  paymentMethod: 'pix' | 'cartao';
  installments: number;
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

interface ProjectDetailsProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    clientName: string;
    budget: number;
  };
}

export default function ProjectDetails({ open, onClose, project }: ProjectDetailsProps) {
  const [tabValue, setTabValue] = useState(0);
  const { transactions, setTransactions } = useFinanceContext();

  // Filtrar transações do projeto atual
  const projectTransactions = useMemo(() => {
    return transactions.filter(t => t.project === project.title);
  }, [transactions, project.title]);

  // Calcular totais
  const financialSummary = useMemo(() => {
    return projectTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        if (transaction.status === 'COMPLETED') {
          acc.totalReceived += transaction.amount;
        } else if (transaction.status === 'PENDING') {
          acc.totalPending += transaction.amount;
        }
      }
      return acc;
    }, {
      totalReceived: 0,
      totalPending: 0
    });
  }, [projectTransactions]);

  const handleMarkAsPaid = (installment: any) => {
    // Encontrar a transação correspondente
    const transaction = transactions.find(t => 
      t.project === project.title && 
      t.type === 'INCOME' && 
      t.amount === installment.amount &&
      t.status === 'PENDING'
    );

    if (transaction) {
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id 
          ? { 
              ...t, 
              status: 'COMPLETED' as const,
              paidAt: new Date().toISOString().split('T')[0]
            } 
          : t
      ));
    }
  };

  const handleRevertPayment = (installment: any) => {
    // Encontrar a transação correspondente
    const transaction = transactions.find(t => 
      t.project === project.title && 
      t.type === 'INCOME' && 
      t.amount === installment.amount &&
      t.status === 'COMPLETED'
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

  // Estados para os diálogos
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [openFileDialog, setOpenFileDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [openStepDialog, setOpenStepDialog] = useState(false);

  // Estados para os formulários
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'ACTIVE' as const,
  });

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    value: '',
    type: 'entrada',
    date: new Date().toISOString().split('T')[0],
  });

  const [newEvent, setNewEvent] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modificar o estado do novo membro para armazenar apenas o ID do funcionário selecionado
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState({
    description: '',
    value: '',
    type: 'entrada',
    date: '',
  });

  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo>({
    totalValue: project.budget,
    paymentMethod: 'pix',
    installments: 3,
    installmentDates: ['2024-03-01', '2024-04-01', '2024-05-01'],
    installmentsList: [
      { number: 1, dueDate: '2024-03-01', value: project.budget / 3, status: 'PENDING' },
      { number: 2, dueDate: '2024-04-01', value: project.budget / 3, status: 'PENDING' },
      { number: 3, dueDate: '2024-05-01', value: project.budget / 3, status: 'PENDING' },
    ]
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudgetInfo, setTempBudgetInfo] = useState<BudgetInfo>({
    totalValue: project.budget,
    paymentMethod: 'pix',
    installments: 3,
    installmentDates: ['2024-03-01', '2024-04-01', '2024-05-01'],
    installmentsList: [
      { number: 1, dueDate: '2024-03-01', value: project.budget / 3, status: 'PENDING' },
      { number: 2, dueDate: '2024-04-01', value: project.budget / 3, status: 'PENDING' },
      { number: 3, dueDate: '2024-05-01', value: project.budget / 3, status: 'PENDING' },
    ]
  });

  const [editingStep, setEditingStep] = useState<null | typeof mockProjectSteps[0]>(null);
  const [steps, setSteps] = useState(mockProjectSteps);
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
  });

  const [newTimelineEvent, setNewTimelineEvent] = useState({
    type: 'CUSTOM',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Adicionar estado para controle da foto
  const [selectedMemberPhoto, setSelectedMemberPhoto] = useState<File | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveMember = () => {
    const newMemberData = {
      id: (Math.max(...mockTeamMembers.map(m => Number(m.id))) + 1).toString(),
      ...newMember,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    console.log('Novo membro adicionado:', newMemberData);
    setOpenMemberDialog(false);
  };

  const handleFileUpload = () => {
    // Aqui você adicionaria a lógica para upload do arquivo
    console.log('Arquivo selecionado:', selectedFile);
    setOpenFileDialog(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddTransaction = () => {
    const newTransactionData = {
      id: (Math.max(...mockFinancialTransactions.map(t => Number(t.id))) + 1).toString(),
      date: newTransaction.date,
      description: newTransaction.description,
      value: Number(newTransaction.value) * (newTransaction.type === 'saída' ? -1 : 1),
      type: newTransaction.type,
      editHistory: []
    };
    mockFinancialTransactions.push(newTransactionData);
    setOpenTransactionDialog(false);
    setNewTransaction({
      description: '',
      value: '',
      type: 'entrada',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleAddEvent = () => {
    // Aqui você adicionaria a lógica para salvar o novo evento
    console.log('Novo evento:', newEvent);
    setOpenEventDialog(false);
    setNewEvent({
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransactionId(transaction.id);
    setEditingTransaction({
      description: transaction.description,
      value: Math.abs(transaction.value).toString(),
      type: transaction.type,
      date: transaction.date,
    });
    setOpenTransactionDialog(true);
  };

  const handleUpdateTransaction = () => {
    const transactionIndex = mockFinancialTransactions.findIndex(t => t.id === editingTransactionId);
    if (transactionIndex !== -1) {
      mockFinancialTransactions[transactionIndex] = {
        ...mockFinancialTransactions[transactionIndex],
        description: editingTransaction.description,
        value: Number(editingTransaction.value) * (editingTransaction.type === 'saída' ? -1 : 1),
        type: editingTransaction.type,
        date: editingTransaction.date,
        editHistory: [
          ...mockFinancialTransactions[transactionIndex].editHistory,
          {
            date: new Date().toISOString(),
            description: 'Transação atualizada',
            editor: 'Usuário'
          }
        ]
      };
    }
    setOpenTransactionDialog(false);
    setEditingTransactionId(null);
    setEditingTransaction({
      description: '',
      value: '',
      type: 'entrada',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveBudgetInfo = () => {
    setBudgetInfo(tempBudgetInfo);
    setEditingBudget(false);
  };

  const handleInstallmentsChange = (value: number) => {
    const dates = Array.from({ length: value }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() + index);
      return date.toISOString().split('T')[0];
    });

    const installmentValue = tempBudgetInfo.totalValue / value;
    const installmentsList = dates.map((date, index) => ({
      number: index + 1,
      dueDate: date,
      value: installmentValue,
      status: 'PENDING' as const
    }));

    setTempBudgetInfo({
      ...tempBudgetInfo,
      installments: value,
      installmentDates: dates,
      installmentsList
    });
  };

  const handleAddStep = () => {
    const step = {
      id: Math.max(...steps.map(s => s.id)) + 1,
      ...newStep,
      status: 'PENDING',
      completedAt: null,
    };
    setSteps([...steps, step]);
    setOpenStepDialog(false);
    setNewStep({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
    });
  };

  const handleUpdateStepStatus = (stepId: number, newStatus: string) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null,
        };
      }
      return step;
    }));
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'IN_PROGRESS':
        return <InProgressIcon color="primary" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStepProgress = () => {
    const completed = steps.filter(step => step.status === 'COMPLETED').length;
    return (completed / steps.length) * 100;
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <CheckCircleIcon />;
      case 'DOCUMENT':
        return <AttachFileIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const handleAddTimelineEvent = () => {
    console.log('Novo evento na linha do tempo:', newTimelineEvent);
    setOpenEventDialog(false);
    setNewTimelineEvent({
      type: 'CUSTOM',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Adicionar função para lidar com a mudança de foto
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedMemberPhoto(file);
      setEditingMemberId(memberId);
      
      // Aqui você atualizaria a foto do membro
      console.log(`Foto atualizada para o membro ${memberId}:`, file);
      
      // Limpar os estados
      setTimeout(() => {
        setSelectedMemberPhoto(null);
        setEditingMemberId(null);
      }, 1000);
    }
  };

  const renderFinanceiroTab = () => {
    const installments = projectTransactions
      .filter(t => t.type === 'INCOME')
      .sort((a, b) => a.installmentNumber - b.installmentNumber);

    const formatDate = (date: string | undefined) => {
      if (!date) return '-';
      try {
        return format(new Date(date), 'dd/MM/yyyy');
      } catch {
        return '-';
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Orçamento e Parcelas
        </Typography>
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Valor Total do Projeto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Total Recebido: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialSummary.totalReceived)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="subtitle1" gutterBottom>
          Parcelas
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parcela</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data Pagamento</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {installments.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.installmentNumber}ª Parcela</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status === 'COMPLETED' ? 'Pago' : 'Pendente'} 
                      color={transaction.status === 'COMPLETED' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(transaction.paidAt)}
                  </TableCell>
                  <TableCell>
                    {transaction.status === 'PENDING' ? (
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleMarkAsPaid(transaction)}
                      >
                        <CheckCircleOutlineIcon />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        color="warning" 
                        onClick={() => handleRevertPayment(transaction)}
                      >
                        <UndoIcon />
                      </IconButton>
                    )}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              {project.title}
            </Typography>
            <IconButton edge="end" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project details tabs">
              <Tab icon={<StepsIcon />} label="Etapas" />
              <Tab icon={<TeamIcon />} label="Equipe" />
              <Tab icon={<FileIcon />} label="Arquivos" />
              <Tab icon={<MonetizationOnIcon />} label="Financeiro" />
              <Tab icon={<ScheduleIcon />} label="Linha do Tempo" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Progresso do Projeto
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getStepProgress()} 
                sx={{ mb: 1, height: 8, borderRadius: 2 }} 
              />
              <Typography variant="body2" color="text.secondary">
                {steps.filter(step => step.status === 'COMPLETED').length} de {steps.length} etapas concluídas
              </Typography>
            </Box>

            <List>
              {steps.map((step) => (
                <ListItem
                  key={step.id}
                  sx={{
                    mb: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <ListItemAvatar>
                    <IconButton
                      onClick={() => {
                        const nextStatus = {
                          'PENDING': 'IN_PROGRESS',
                          'IN_PROGRESS': 'COMPLETED',
                          'COMPLETED': 'PENDING',
                        }[step.status];
                        handleUpdateStepStatus(step.id, nextStatus);
                      }}
                    >
                      {getStepStatusIcon(step.status)}
                    </IconButton>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        {step.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Prazo: {new Date(step.deadline).toLocaleDateString('pt-BR')}
                          </Typography>
                          {step.completedAt && (
                            <Typography variant="caption" color="success.main">
                              Concluído em: {new Date(step.completedAt).toLocaleDateString('pt-BR')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={() => setOpenStepDialog(true)}
            >
              Adicionar Etapa
            </Button>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {mockTeamMembers.map((member) => (
                <ListItem
                  key={member.id}
                  sx={{
                    mb: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Box component="label" sx={{ cursor: 'pointer' }}>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handlePhotoChange(e, member.id)}
                      />
                      <Avatar 
                        src={member.avatar} 
                        alt={member.name}
                        sx={{ 
                          width: 50, 
                          height: 50,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            cursor: 'pointer'
                          }
                        }}
                      />
                      {editingMemberId === member.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            color: 'white'
                          }}
                        >
                          <UploadIcon />
                        </Box>
                      )}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role}
                  />
                  <Chip
                    label={member.status === 'ACTIVE' ? 'Ativo' : 'Em Férias'}
                    color={member.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <IconButton 
                    edge="end" 
                    onClick={() => {
                      setNewMember({
                        name: member.name,
                        role: member.role,
                        email: '',
                        phone: '',
                        status: member.status,
                      });
                      setOpenMemberDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }} 
              onClick={() => {
                setNewMember({
                  name: '',
                  role: '',
                  email: '',
                  phone: '',
                  status: 'ACTIVE',
                });
                setOpenMemberDialog(true);
              }}
              startIcon={<AddIcon />}
            >
              Adicionar Membro
            </Button>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <List>
              {mockFiles.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="download">
                      <FileIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${file.type} • ${file.size}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setOpenFileDialog(true)}>
              Upload de Arquivo
            </Button>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderFinanceiroTab()}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Histórico do Projeto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acompanhamento de todas as atividades, mudanças e marcos importantes do projeto
              </Typography>
            </Box>

            <Timeline>
              {mockTimelineEvents.map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(event.date).toLocaleDateString('pt-BR')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={event.type === 'TASK' ? 'success' : 'primary'}>
                      {getTimelineIcon(event.type)}
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ 
                      bgcolor: 'background.paper',
                      p: 2,
                      borderRadius: 1,
                      boxShadow: 1,
                      '&:hover': { boxShadow: 2 }
                    }}>
                      <Typography variant="subtitle1" component="div">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={() => setOpenEventDialog(true)}
            >
              Adicionar Evento
            </Button>
          </TabPanel>
        </DialogContent>
      </Dialog>

      {/* Diálogo para membros */}
      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)}>
        <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Cargo"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Telefone"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newMember.status}
                label="Status"
                onChange={(e) => setNewMember({ ...newMember, status: e.target.value as 'ACTIVE' | 'ON_VACATION' })}
              >
                <MenuItem value="ACTIVE">Ativo</MenuItem>
                <MenuItem value="ON_VACATION">Em Férias</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveMember}
            variant="contained"
            disabled={!newMember.name || !newMember.role}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para upload de arquivo */}
      <Dialog open={openFileDialog} onClose={() => setOpenFileDialog(false)}>
        <DialogTitle>Upload de Arquivo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Selecionar Arquivo
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Arquivo selecionado: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFileDialog(false)}>Cancelar</Button>
          <Button onClick={handleFileUpload} variant="contained" disabled={!selectedFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para registrar/editar transação */}
      <Dialog open={openTransactionDialog} onClose={() => {
        setOpenTransactionDialog(false);
        setEditingTransactionId(null);
      }}>
        <DialogTitle>
          {editingTransactionId ? 'Editar Transação' : 'Registrar Transação'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Descrição"
              value={editingTransactionId ? editingTransaction.description : newTransaction.description}
              onChange={(e) => editingTransactionId 
                ? setEditingTransaction({ ...editingTransaction, description: e.target.value })
                : setNewTransaction({ ...newTransaction, description: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={editingTransactionId ? editingTransaction.value : newTransaction.value}
              onChange={(e) => editingTransactionId
                ? setEditingTransaction({ ...editingTransaction, value: e.target.value })
                : setNewTransaction({ ...newTransaction, value: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={editingTransactionId ? editingTransaction.type : newTransaction.type}
                label="Tipo"
                onChange={(e) => editingTransactionId
                  ? setEditingTransaction({ ...editingTransaction, type: e.target.value })
                  : setNewTransaction({ ...newTransaction, type: e.target.value })
                }
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saída">Saída</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={editingTransactionId ? editingTransaction.date : newTransaction.date}
              onChange={(e) => editingTransactionId
                ? setEditingTransaction({ ...editingTransaction, date: e.target.value })
                : setNewTransaction({ ...newTransaction, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenTransactionDialog(false);
            setEditingTransactionId(null);
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={editingTransactionId ? handleUpdateTransaction : handleAddTransaction} 
            variant="contained"
          >
            {editingTransactionId ? 'Salvar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para adicionar evento na linha do tempo */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)}>
        <DialogTitle>Adicionar Evento na Linha do Tempo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Evento</InputLabel>
              <Select
                value={newTimelineEvent.type}
                label="Tipo de Evento"
                onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, type: e.target.value })}
              >
                <MenuItem value="CUSTOM">Evento Personalizado</MenuItem>
                <MenuItem value="TASK">Tarefa Concluída</MenuItem>
                <MenuItem value="DOCUMENT">Documento</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Título"
              value={newTimelineEvent.title}
              onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={newTimelineEvent.description}
              onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={newTimelineEvent.date}
              onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddTimelineEvent} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar informações do orçamento */}
      <Dialog 
        open={editingBudget} 
        onClose={() => {
          setEditingBudget(false);
          setTempBudgetInfo({
            ...budgetInfo,
            totalValue: project.budget
          });
        }}
      >
        <DialogTitle>Editar Informações do Orçamento</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Valor Total do Projeto"
              type="number"
              value={project.budget}
              disabled
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select
                value={tempBudgetInfo.paymentMethod}
                label="Forma de Pagamento"
                onChange={(e) => setTempBudgetInfo({ 
                  ...tempBudgetInfo, 
                  paymentMethod: e.target.value as 'pix' | 'cartao' 
                })}
              >
                <MenuItem value="pix">PIX</MenuItem>
                <MenuItem value="cartao">Cartão</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Número de Parcelas</InputLabel>
              <Select
                value={tempBudgetInfo.installments}
                label="Número de Parcelas"
                onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <MenuItem key={num} value={num}>{num}x</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Datas de Vencimento
            </Typography>
            {tempBudgetInfo.installmentDates.map((date, index) => (
              <TextField
                key={index}
                fullWidth
                label={`${index + 1}ª Parcela`}
                type="date"
                value={date}
                onChange={(e) => {
                  const newDates = [...tempBudgetInfo.installmentDates];
                  newDates[index] = e.target.value;
                  setTempBudgetInfo({ ...tempBudgetInfo, installmentDates: newDates });
                }}
                InputLabelProps={{ shrink: true }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditingBudget(false);
            setTempBudgetInfo({
              ...budgetInfo,
              totalValue: project.budget
            });
          }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveBudgetInfo} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para adicionar/editar etapa */}
      <Dialog
        open={openStepDialog}
        onClose={() => {
          setOpenStepDialog(false);
          setEditingStep(null);
          setNewStep({
            title: '',
            description: '',
            deadline: new Date().toISOString().split('T')[0],
          });
        }}
      >
        <DialogTitle>
          {editingStep ? 'Editar Etapa' : 'Nova Etapa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Título da Etapa</InputLabel>
              <Select
                value={editingStep ? editingStep.title : newStep.title}
                label="Título da Etapa"
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingStep) {
                    setEditingStep({ ...editingStep, title: value });
                  } else {
                    setNewStep({ ...newStep, title: value });
                  }
                }}
              >
                {commonSteps.map((step) => (
                  <MenuItem key={step} value={step}>{step}</MenuItem>
                ))}
                <MenuItem value="other">Outra Etapa...</MenuItem>
              </Select>
            </FormControl>
            {((editingStep?.title === 'other') || (newStep.title === 'other')) && (
              <TextField
                fullWidth
                label="Título Personalizado"
                value={editingStep ? editingStep.title : newStep.title}
                onChange={(e) => {
                  if (editingStep) {
                    setEditingStep({ ...editingStep, title: e.target.value });
                  } else {
                    setNewStep({ ...newStep, title: e.target.value });
                  }
                }}
              />
            )}
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={editingStep ? editingStep.description : newStep.description}
              onChange={(e) => editingStep
                ? setEditingStep({ ...editingStep, description: e.target.value })
                : setNewStep({ ...newStep, description: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Prazo"
              type="date"
              value={editingStep ? editingStep.deadline : newStep.deadline}
              onChange={(e) => editingStep
                ? setEditingStep({ ...editingStep, deadline: e.target.value })
                : setNewStep({ ...newStep, deadline: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenStepDialog(false);
            setEditingStep(null);
          }}>
            Cancelar
          </Button>
          <Button
            onClick={editingStep ? () => {
              setSteps(steps.map(s => s.id === editingStep.id ? editingStep : s));
              setOpenStepDialog(false);
              setEditingStep(null);
            } : handleAddStep}
            variant="contained"
          >
            {editingStep ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 