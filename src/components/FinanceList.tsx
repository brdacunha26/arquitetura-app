'use client';

import { Box, List, ListItem, ListItemText, Typography, Chip } from '@mui/material';
import { useFinanceContext } from '@/contexts/FinanceContext';

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
  PAID: '#4caf50',
  OVERDUE: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
};

export default function FinanceList() {
  const { transactions } = useFinanceContext();

  // Ordenar transações por data
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <List>
      {sortedTransactions.map((transaction) => (
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
            primary={transaction.description}
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {transaction.project}
                </Typography>
                <Typography
                  variant="body2"
                  color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(transaction.amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transaction.date.toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        </ListItem>
      ))}
    </List>
  );
} 