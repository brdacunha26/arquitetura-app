'use client';

import { Box, Paper, Typography, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useProjects } from '@/contexts/ProjectContext';
import { format, isBefore, startOfToday } from 'date-fns';

export default function FinancialSummary() {
  const { projects, isLoading } = useProjects();
  const today = startOfToday();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('Projetos:', projects); // Debug

  // Calcular totais gerais a partir das parcelas dos projetos
  const summary = projects.reduce((acc, project) => {
    console.log('Processando projeto:', project.title); // Debug
    const installments = project.installments || [];
    console.log('Parcelas:', installments); // Debug
    
    installments.forEach(installment => {
      const dueDate = new Date(installment.dueDate);
      const isOverdue = installment.status === 'PENDING' && isBefore(dueDate, today);
      const isPending = installment.status === 'PENDING' && !isOverdue;
      const amount = Number(installment.value);

      console.log('Processando parcela:', { // Debug
        dueDate,
        isOverdue,
        isPending,
        amount,
        status: installment.status
      });

      // Todas as parcelas são consideradas receitas
      acc.totalReceitas += amount;
      if (isOverdue) acc.receitasAtrasadas += amount;
      if (isPending) acc.receitasPendentes += amount;
    });

    return acc;
  }, {
    totalReceitas: 0,
    receitasAtrasadas: 0,
    receitasPendentes: 0
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const SummaryCard = ({ title, total, atrasado, pendente, color }: { 
    title: string;
    total: number;
    atrasado: number;
    pendente: number;
    color: string;
  }) => (
    <Paper sx={{ p: 2, bgcolor: color, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'medium', mb: 2 }}>
          {formatCurrency(total)}
        </Typography>
        <Typography variant="body2" color="error.main" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Atrasado:</span>
          <span>{formatCurrency(atrasado)}</span>
        </Typography>
        <Typography variant="body2" color="warning.main" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Pendente:</span>
          <span>{formatCurrency(pendente)}</span>
        </Typography>
      </Box>
    </Paper>
  );

  // Calcular o total recebido (parcelas pagas)
  const totalRecebido = projects.reduce((total, project) => {
    const installments = project.installments || [];
    return total + installments
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.value, 0);
  }, 0);

  // Preparar dados para a tabela de detalhamento
  const allInstallments = projects.flatMap(project => 
    (project.installments || []).map(installment => ({
      ...installment,
      projectTitle: project.title,
      projectId: project.id
    }))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Resumo Geral
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Receitas"
            total={summary.totalReceitas}
            atrasado={summary.receitasAtrasadas}
            pendente={summary.receitasPendentes}
            color="#e3f2fd"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Recebido"
            total={totalRecebido}
            atrasado={0}
            pendente={0}
            color="#e8f5e9"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="A Receber"
            total={summary.totalReceitas - totalRecebido}
            atrasado={summary.receitasAtrasadas}
            pendente={summary.receitasPendentes}
            color="#fff3e0"
          />
        </Grid>
      </Grid>

      {/* Detalhamento das Parcelas */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, color: 'primary.main' }}>
        Detalhamento das Parcelas
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Projeto</TableCell>
              <TableCell>Parcela</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Pagamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allInstallments.map((installment) => {
              const dueDate = new Date(installment.dueDate);
              const isOverdue = installment.status === 'PENDING' && isBefore(dueDate, today);
              
              return (
                <TableRow key={installment.id}>
                  <TableCell>{installment.projectTitle}</TableCell>
                  <TableCell>{`${installment.number}ª Parcela`}</TableCell>
                  <TableCell align="right">{formatCurrency(installment.value)}</TableCell>
                  <TableCell>{formatDate(installment.dueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        installment.status === 'PAID' ? 'Pago' :
                        isOverdue ? 'Atrasado' : 'Pendente'
                      }
                      color={
                        installment.status === 'PAID' ? 'success' :
                        isOverdue ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {installment.paymentDate ? formatDate(installment.paymentDate) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 