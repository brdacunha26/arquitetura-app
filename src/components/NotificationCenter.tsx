'use client';

import { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Badge, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Notifications as NotificationsIcon, Warning as WarningIcon, AttachMoney as MoneyIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { useTaskContext } from '@/contexts/TaskContext';
import { useFinanceContext } from '@/contexts/FinanceContext';

export default function NotificationCenter() {
  const { tasks } = useTaskContext();
  const { transactions } = useFinanceContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Calcular notificações de tarefas próximas do prazo (3 dias) ou atrasadas
  const taskNotifications = useMemo(() => {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    return tasks
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        return (
          task.status !== 'COMPLETED' && (
            task.status === 'DELAYED' ||
            (dueDate <= threeDaysFromNow && dueDate >= today)
          )
        );
      })
      .map(task => ({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        message: task.status === 'DELAYED'
          ? 'Tarefa atrasada'
          : 'Prazo próximo de vencer',
        dueDate: task.dueDate,
        priority: task.status === 'DELAYED' ? 'high' : 'medium'
      }));
  }, [tasks]);

  // Calcular notificações de pagamentos próximos do prazo (5 dias) ou atrasados
  const paymentNotifications = useMemo(() => {
    const today = new Date();
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);

    return transactions
      .filter(transaction => {
        const dueDate = new Date(transaction.date);
        return (
          transaction.type === 'INCOME' &&
          transaction.status !== 'PAID' && (
            transaction.status === 'OVERDUE' ||
            (dueDate <= fiveDaysFromNow && dueDate >= today)
          )
        );
      })
      .map(transaction => ({
        id: `payment-${transaction.id}`,
        type: 'payment',
        title: transaction.description,
        message: transaction.status === 'OVERDUE'
          ? 'Pagamento atrasado'
          : 'Pagamento próximo do vencimento',
        dueDate: transaction.date,
        amount: transaction.amount,
        priority: transaction.status === 'OVERDUE' ? 'high' : 'medium'
      }));
  }, [transactions]);

  // Combinar e ordenar todas as notificações
  const allNotifications = useMemo(() => {
    const combined = [...taskNotifications, ...paymentNotifications];
    return combined.sort((a, b) => {
      // Primeiro por prioridade
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      // Depois por data
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [taskNotifications, paymentNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          position: 'fixed',
          top: 16,
          right: 16,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Badge badgeContent={allNotifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            width: '350px',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificações
          </Typography>
        </Box>
        <Divider />
        
        {allNotifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="Nenhuma notificação" />
          </MenuItem>
        ) : (
          allNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleClose}
              sx={{
                borderLeft: 4,
                borderColor: notification.priority === 'high' ? 'error.main' : 'warning.main',
              }}
            >
              <ListItemIcon>
                {notification.type === 'task' ? (
                  <ScheduleIcon color={notification.priority === 'high' ? 'error' : 'warning'} />
                ) : (
                  <MoneyIcon color={notification.priority === 'high' ? 'error' : 'warning'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant="body2" component="span" display="block">
                      {notification.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" display="block">
                      Vencimento: {new Date(notification.dueDate).toLocaleDateString('pt-BR')}
                      {'amount' in notification && (
                        <> • Valor: {formatCurrency(notification.amount)}</>
                      )}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
} 