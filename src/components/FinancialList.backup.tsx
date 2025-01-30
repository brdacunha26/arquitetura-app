'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Grid,
  Menu,
  MenuItem,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { useFinanceContext } from '@/contexts/FinanceContext';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface FinancialListProps {
  budget: number;
  selectedYear: number;
  selectedProject: string;
}

const statusColors = {
  PENDING: '#ff9800',
  COMPLETED: '#4caf50',
  CANCELLED: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export default function FinancialList({ budget, selectedYear, selectedProject }: FinancialListProps) {
  const { 
    transactions, 
    setTransactions, 
    setEditingTransaction, 
    setIsDialogOpen,
    setFormData 
  } = useFinanceContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  // Filtrar transações por ano e projeto
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesYear = transaction.date.getFullYear() === selectedYear;
      const matchesProject = !selectedProject || transaction.project === selectedProject;
      return matchesYear && matchesProject;
    });
  }, [transactions, selectedYear, selectedProject]);

  // Calcular orçamento do projeto selecionado
  const projectBudget = useMemo(() => {
    if (!selectedProject) {
      // Se nenhum projeto estiver selecionado, somar o orçamento de todos os projetos do ano
      const uniqueProjects = new Set<string>();
      const totalBudget = transactions
        .filter(t => {
          const matchesYear = t.date.getFullYear() === selectedYear;
          if (matchesYear && t.project && !uniqueProjects.has(t.project)) {
            uniqueProjects.add(t.project);
            return true;
          }
          return false;
        })
        .reduce((sum, t) => sum + (t.budget || 0), 0);
      return totalBudget;
    }
    // Se um projeto estiver selecionado, usar seu orçamento específico
    const project = transactions.find(t => t.project === selectedProject);
    return project?.budget || 0;
  }, [selectedProject, transactions, selectedYear]);

  // Cálculos financeiros baseados nas transações filtradas
  const financialSummary = useMemo(() => {
    const summary = filteredTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        if (transaction.status === 'COMPLETED') {
          acc.totalIncome += transaction.amount;
        }
        if (transaction.status === 'PENDING') {
          acc.pendingIncome += transaction.amount;
        }
      } else {
        if (transaction.status === 'COMPLETED') {
          acc.totalExpenses += transaction.amount;
        }
        if (transaction.status === 'PENDING') {
          acc.pendingExpenses += transaction.amount;
        }
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      pendingIncome: 0,
      pendingExpenses: 0
    });

    const totalReceived = summary.totalIncome; // Apenas valores já recebidos (concluídos)
    const valuesToReceive = projectBudget - totalReceived; // Diferença entre orçamento e recebido

    return {
      ...summary,
      balance: summary.totalIncome - summary.totalExpenses,
      progress: (summary.totalExpenses / projectBudget) * 100,
      valuesToReceive
    };
  }, [filteredTransactions, projectBudget]);

  // Calcular pagamentos vencidos e próximos do vencimento
  const paymentAlerts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return filteredTransactions
      .filter(t => t.type === 'INCOME' && t.status === 'PENDING' && t.dueDate)
      .reduce((acc, transaction) => {
        const dueDate = new Date(transaction.dueDate!);
        
        if (dueDate < today) {
          acc.overdue.push(transaction);
        } else if (dueDate <= thirtyDaysFromNow) {
          acc.upcoming.push(transaction);
        }
        
        return acc;
      }, {
        overdue: [] as typeof filteredTransactions,
        upcoming: [] as typeof filteredTransactions
      });
  }, [filteredTransactions]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, transactionId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleEdit = () => {
    if (selectedTransaction) {
      const transaction = transactions.find(t => t.id === selectedTransaction);
      if (transaction) {
        setEditingTransaction(transaction);
        setFormData({
          description: transaction.description,
          amount: transaction.amount.toString(),
          type: transaction.type,
          status: transaction.status === 'COMPLETED' ? 'PAID' : transaction.status === 'CANCELLED' ? 'OVERDUE' : 'PENDING',
          date: transaction.date.toISOString().split('T')[0],
          project: transaction.project
        });
        setIsDialogOpen(true);
      }
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      setTransactions(prev => prev.filter(t => t.id !== selectedTransaction));
    }
    handleMenuClose();
  };

  // Dados para o gráfico de rosca
  const expensesByCategory = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc: { [key: string]: number }, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }, [filteredTransactions]);

  const chartData = {
    labels: Object.keys(expensesByCategory).map(cat => 
      cat.replace('_', ' ').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    ),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Box>
      {/* Alertas de Pagamentos */}
      {paymentAlerts.overdue.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Pagamentos Vencidos</AlertTitle>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total vencido: {paymentAlerts.overdue
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
            </Typography>
            {paymentAlerts.overdue.map(payment => (
              <Typography key={payment.id} variant="body2">
                • {payment.description} - Vencimento: {payment.dueDate?.toLocaleDateString('pt-BR')} - {
                  payment.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })
                } - {payment.project}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {paymentAlerts.upcoming.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Pagamentos Próximos do Vencimento (30 dias)</AlertTitle>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total a receber: {paymentAlerts.upcoming
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
            </Typography>
            {paymentAlerts.upcoming.map(payment => (
              <Typography key={payment.id} variant="body2">
                • {payment.description} - Vencimento: {payment.dueDate?.toLocaleDateString('pt-BR')} - {
                  payment.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })
                } - {payment.project}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumo Financeiro {selectedProject ? `- ${selectedProject}` : ''}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Orçamento Total
              </Typography>
              <Typography variant="h6">
                {projectBudget.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Typography>
              {financialSummary.valuesToReceive > 0 && (
                <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                  Valores à Receber: {financialSummary.valuesToReceive.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
              )}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Recebido
              </Typography>
              <Typography variant="h6" color="success.main">
                {financialSummary.totalIncome.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Typography>
              {financialSummary.pendingIncome > 0 && (
                <Typography variant="body2" color="warning.main">
                  Pendente: {financialSummary.pendingIncome.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
              )}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total de Despesas
              </Typography>
              <Typography variant="h6" color="error.main">
                {financialSummary.totalExpenses.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Typography>
              {financialSummary.pendingExpenses > 0 && (
                <Typography variant="body2" color="warning.main">
                  Pendente: {financialSummary.pendingExpenses.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Saldo
              </Typography>
              <Typography
                variant="h6"
                color={financialSummary.balance >= 0 ? 'success.main' : 'error.main'}
              >
                {financialSummary.balance.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Progresso do Orçamento: {financialSummary.progress.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(financialSummary.progress, 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            {Object.keys(expensesByCategory).length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Doughnut data={chartData} options={chartOptions} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhuma despesa registrada
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Transações
      </Typography>

      <List>
        {filteredTransactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <ListItemText
              primary={transaction.description}
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    {transaction.date.toLocaleDateString('pt-BR')}
                  </Typography>
                  {transaction.dueDate && (
                    <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                      Vencimento: {transaction.dueDate.toLocaleDateString('pt-BR')}
                    </Typography>
                  )}
                </>
              }
            />
            <Chip
              label={statusLabels[transaction.status]}
              size="small"
              sx={{
                bgcolor: `${statusColors[transaction.status]}20`,
                color: statusColors[transaction.status],
                mr: 1,
              }}
            />
            <Typography
              variant="body1"
              color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
              sx={{ mx: 2 }}
            >
              {(transaction.type === 'INCOME' ? '+' : '-') +
                ' ' +
                transaction.amount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
            </Typography>
            <IconButton
              edge="end"
              onClick={(e) => handleMenuClick(e, transaction.id)}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
} 