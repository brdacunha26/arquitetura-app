'use client';

import {
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: Date;
  category: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
};

interface FinancialListProps {
  budget: number;
  transactions: Transaction[];
  onEditTransaction?: (transactionId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

export default function FinancialList({
  budget,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}: FinancialListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transactionId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTransaction(null);
  };

  const handleEdit = () => {
    if (selectedTransaction && onEditTransaction) {
      onEditTransaction(selectedTransaction);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTransaction && onDeleteTransaction) {
      onDeleteTransaction(selectedTransaction);
    }
    handleMenuClose();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const progress = (totalIncome / budget) * 100;

  // Dados para o gráfico de rosca
  const chartData = {
    labels: ['Recebido', 'Despesas', 'Disponível'],
    datasets: [
      {
        data: [totalIncome, totalExpenses, Math.max(0, budget - totalExpenses)],
        backgroundColor: ['#4caf50', '#f44336', '#9e9e9e'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

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

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ height: 250, position: 'relative', mb: 2 }}>
              <Doughnut data={chartData} options={chartOptions} />
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Saldo Total
              </Typography>
              <Typography
                variant="body1"
                color={balance >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(balance)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography variant="body2">
                <strong>Orçamento:</strong> {formatCurrency(budget)}
              </Typography>
              <Typography variant="body2">
                <strong>Recebido:</strong> {formatCurrency(totalIncome)}
              </Typography>
              <Typography variant="body2">
                <strong>Despesas:</strong> {formatCurrency(totalExpenses)}
              </Typography>
              <Typography variant="body2">
                <strong>Progresso:</strong> {progress.toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de Transações */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transações
            </Typography>
            <List>
              {transactions.map((transaction) => (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {transaction.type === 'INCOME' ? (
                          <IncomeIcon color="success" />
                        ) : (
                          <ExpenseIcon color="error" />
                        )}
                        <Typography variant="subtitle1">
                          {transaction.description}
                        </Typography>
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
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.category} • {transaction.date.toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Typography
                      variant="subtitle1"
                      color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                      sx={{ mr: 2 }}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleMenuOpen(e, transaction.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
        </Menu>
      </Grid>
    </Box>
  );
} 