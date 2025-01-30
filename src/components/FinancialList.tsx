'use client';

import { Box, List, ListItem, ListItemText, Typography, Chip, IconButton, Menu, MenuItem, ListItemIcon, Paper, Grid, Alert, AlertTitle } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, TrendingUp as IncomeIcon, TrendingDown as ExpenseIcon } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeColors = {
  INCOME: '#4caf50',
  EXPENSE: '#f44336',
};

const typeLabels = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
};

const statusColors = {
  PENDING: '#ff9800',
  COMPLETED: '#4caf50',
  OVERDUE: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  COMPLETED: 'Pago',
  OVERDUE: 'Atrasado',
};

interface FinancialListProps {
  selectedYear?: number;
  selectedProject?: string;
}

export default function FinancialList({ selectedYear, selectedProject }: FinancialListProps) {
  const { transactions, setEditingTransaction, setIsDialogOpen, deleteTransaction } = useFinanceContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionYear = new Date(transaction.date).getFullYear();
      const matchesYear = selectedYear ? transactionYear === selectedYear : true;
      const matchesProject = selectedProject ? transaction.project === selectedProject : true;
      return matchesYear && matchesProject;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedProject]);

  const financialSummary = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const amount = transaction.amount;
      if (transaction.type === 'INCOME') {
        acc.totalIncome += amount;
        if (transaction.status === 'COMPLETED') {
          acc.receivedIncome += amount;
        } else if (transaction.status === 'PENDING') {
          acc.pendingIncome += amount;
        } else if (transaction.status === 'OVERDUE') {
          acc.overdueIncome += amount;
        }
      } else {
        acc.totalExpenses += amount;
        if (transaction.status === 'COMPLETED') {
          acc.paidExpenses += amount;
        } else if (transaction.status === 'PENDING') {
          acc.pendingExpenses += amount;
        } else if (transaction.status === 'OVERDUE') {
          acc.overdueExpenses += amount;
        }
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      receivedIncome: 0,
      paidExpenses: 0,
      pendingIncome: 0,
      pendingExpenses: 0,
      overdueIncome: 0,
      overdueExpenses: 0,
    });
  }, [filteredTransactions]);

  const paymentAlerts = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const overdue = filteredTransactions.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      return isBefore(dueDate, today);
    });

    const upcoming = filteredTransactions.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
    });

    return { overdue, upcoming };
  }, [filteredTransactions]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transactionId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTransaction(null);
  };

  const handleEdit = () => {
    const transaction = transactions.find(t => t.id === selectedTransaction);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction);
    }
    handleMenuClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Box>
      {/* Alertas de Pagamento */}
      {paymentAlerts.overdue.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Pagamentos Vencidos</AlertTitle>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total: {formatCurrency(paymentAlerts.overdue.reduce((sum, t) => sum + t.amount, 0))}
            </Typography>
            {paymentAlerts.overdue.map(payment => (
              <Typography key={payment.id} variant="body2">
                • {payment.description} - Vencimento: {formatDate(payment.dueDate!)} - {formatCurrency(payment.amount)}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {paymentAlerts.upcoming.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Pagamentos Próximos</AlertTitle>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total: {formatCurrency(paymentAlerts.upcoming.reduce((sum, t) => sum + t.amount, 0))}
            </Typography>
            {paymentAlerts.upcoming.map(payment => (
              <Typography key={payment.id} variant="body2">
                • {payment.description} - Vencimento: {formatDate(payment.dueDate!)} - {formatCurrency(payment.amount)}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Resumo Financeiro */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Receitas</Typography>
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography variant="body2">
                Total: {formatCurrency(financialSummary.totalIncome)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Recebido: {formatCurrency(financialSummary.receivedIncome)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Pendente: {formatCurrency(financialSummary.pendingIncome)}
              </Typography>
              <Typography variant="body2" color="error.main">
                Vencido: {formatCurrency(financialSummary.overdueIncome)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Despesas</Typography>
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography variant="body2">
                Total: {formatCurrency(financialSummary.totalExpenses)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Pago: {formatCurrency(financialSummary.paidExpenses)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Pendente: {formatCurrency(financialSummary.pendingExpenses)}
              </Typography>
              <Typography variant="body2" color="error.main">
                Vencido: {formatCurrency(financialSummary.overdueExpenses)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de Transações */}
      <List>
        {filteredTransactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {transaction.type === 'INCOME' ? (
                    <IncomeIcon color="success" fontSize="small" />
                  ) : (
                    <ExpenseIcon color="error" fontSize="small" />
                  )}
                  <Typography variant="subtitle1">
                    {transaction.description}
                  </Typography>
                  <Chip
                    label={typeLabels[transaction.type]}
                    size="small"
                    sx={{
                      backgroundColor: `${typeColors[transaction.type]}20`,
                      color: typeColors[transaction.type],
                    }}
                  />
                  <Chip
                    label={statusLabels[transaction.status]}
                    size="small"
                    sx={{
                      backgroundColor: `${statusColors[transaction.status]}20`,
                      color: statusColors[transaction.status],
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.project && `Projeto: ${transaction.project}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data: {formatDate(transaction.date)}
                    </Typography>
                    {transaction.dueDate && (
                      <Typography variant="body2" color="text.secondary">
                        Vencimento: {formatDate(transaction.dueDate)}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Categoria: {transaction.category}
                  </Typography>
                </Box>
              }
            />
            <IconButton
              edge="end"
              onClick={(e) => handleMenuOpen(e, transaction.id)}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
} 