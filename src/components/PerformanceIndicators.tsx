'use client';

import { Box, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { useTaskContext } from '@/contexts/TaskContext';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { useMemo } from 'react';

export default function PerformanceIndicators() {
  const { tasks } = useTaskContext();
  const { transactions } = useFinanceContext();
  const { members } = useTeamContext();

  // Calcular taxa de conclusão de tarefas
  const taskCompletionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    return (completedTasks / tasks.length) * 100;
  }, [tasks]);

  // Calcular taxa de tarefas atrasadas
  const delayedTasksRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const delayedTasks = tasks.filter(task => task.status === 'DELAYED').length;
    return (delayedTasks / tasks.length) * 100;
  }, [tasks]);

  // Calcular margem de lucro
  const profitMargin = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    if (income === 0) return 0;
    return ((income - expenses) / income) * 100;
  }, [transactions]);

  // Calcular taxa de pagamentos em dia
  const onTimePaymentRate = useMemo(() => {
    const payments = transactions.filter(t => t.type === 'INCOME');
    if (payments.length === 0) return 0;
    
    const onTimePayments = payments.filter(t => t.status !== 'OVERDUE').length;
    return (onTimePayments / payments.length) * 100;
  }, [transactions]);

  // Calcular distribuição de carga de trabalho
  const workloadDistribution = useMemo(() => {
    const workload = new Map<string, number>();
    
    members.forEach(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.name);
      workload.set(member.name, memberTasks.length);
    });

    const maxTasks = Math.max(...Array.from(workload.values()));
    const minTasks = Math.min(...Array.from(workload.values()));
    const avgTasks = Array.from(workload.values()).reduce((a, b) => a + b, 0) / workload.size;

    return {
      balanced: maxTasks - minTasks <= 2, // Consideramos balanceado se a diferença for até 2 tarefas
      avgTasksPerMember: avgTasks
    };
  }, [tasks, members]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Indicadores de Desempenho
      </Typography>
      
      <Grid container spacing={2}>
        {/* Taxa de Conclusão de Tarefas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Taxa de Conclusão de Tarefas
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="h4" component="span">
                {taskCompletionRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={taskCompletionRate}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50'
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Taxa de Tarefas Atrasadas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Taxa de Tarefas Atrasadas
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="h4" component="span" color={delayedTasksRate > 20 ? 'error.main' : 'text.primary'}>
                {delayedTasksRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={delayedTasksRate}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#f44336'
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Margem de Lucro */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Margem de Lucro
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="h4" component="span" color={profitMargin < 0 ? 'error.main' : 'success.main'}>
                {profitMargin.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.max(0, Math.min(100, profitMargin))}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: profitMargin < 0 ? '#f44336' : '#4caf50'
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Taxa de Pagamentos em Dia */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Taxa de Pagamentos em Dia
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="h4" component="span" color={onTimePaymentRate < 80 ? 'error.main' : 'success.main'}>
                {onTimePaymentRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={onTimePaymentRate}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: onTimePaymentRate < 80 ? '#f44336' : '#4caf50'
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Distribuição de Carga de Trabalho */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Distribuição de Carga de Trabalho
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="h4" component="span" color={workloadDistribution.balanced ? 'success.main' : 'warning.main'}>
                {workloadDistribution.avgTasksPerMember.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Média de tarefas por membro
              </Typography>
              <Typography variant="body2" color={workloadDistribution.balanced ? 'success.main' : 'warning.main'} sx={{ mt: 0.5 }}>
                {workloadDistribution.balanced ? 'Distribuição balanceada' : 'Distribuição precisa ser ajustada'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 