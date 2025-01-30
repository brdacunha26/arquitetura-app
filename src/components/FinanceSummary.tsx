'use client';

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinanceSummary() {
  const { transactions, totalIncome, totalExpense, balance, deleteTransaction } = useFinanceContext();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, transactionId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction);
    }
    handleMenuClose();
  };

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Paper sx={{ flex: 1, p: 2, bgcolor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IncomeIcon color="success" />
            <Typography variant="subtitle2" color="text.secondary">
              Receitas
            </Typography>
          </Box>
          <Typography variant="h5">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalIncome)}
          </Typography>
        </Paper>

        <Paper sx={{ flex: 1, p: 2, bgcolor: '#fbe9e7' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ExpenseIcon color="error" />
            <Typography variant="subtitle2" color="text.secondary">
              Despesas
            </Typography>
          </Box>
          <Typography variant="h5">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalExpense)}
          </Typography>
        </Paper>

        <Paper sx={{ flex: 1, p: 2, bgcolor: '#e8f5e9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BalanceIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Saldo
            </Typography>
          </Box>
          <Typography variant="h5">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(balance)}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Últimas Transações
        </Typography>
        <List>
          {sortedTransactions.map((transaction) => (
            <Box key={transaction.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={transaction.status}
                      size="small"
                      color={
                        transaction.status === 'COMPLETED'
                          ? 'success'
                          : transaction.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                      }
                    />
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleMenuClick(e, transaction.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={transaction.description}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                      </Typography>
                      {transaction.project && (
                        <Chip
                          label={transaction.project}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: transaction.type === 'INCOME' ? 'success.main' : 'error.main',
                    fontWeight: 'medium',
                    ml: 2,
                  }}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(transaction.amount)}
                </Typography>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Paper>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
} 