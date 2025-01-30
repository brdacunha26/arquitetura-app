'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  AlertTitle,
} from '@mui/material';
import FinancialList from '@/components/FinancialList';
import { useState } from 'react';

// Dados de exemplo - serão substituídos por dados do banco
const mockProjects = [
  {
    id: '1',
    title: 'Residência Moderna Vila Nova',
    budget: 850000,
  },
  {
    id: '2',
    title: 'Reforma Apartamento Jardins',
    budget: 450000,
  },
  {
    id: '3',
    title: 'Projeto Comercial Centro',
    budget: 1200000,
  },
];

const mockTransactions = [
  {
    id: '1',
    projectId: '1',
    type: 'INCOME',
    description: 'Entrada inicial - Projeto Vila Nova',
    amount: 250000,
    date: new Date(2023, 11, 1),
    category: 'Pagamento',
    status: 'COMPLETED',
  },
  {
    id: '2',
    projectId: '1',
    type: 'EXPENSE',
    description: 'Material de construção',
    amount: 75000,
    date: new Date(2024, 0, 15),
    category: 'Materiais',
    status: 'COMPLETED',
  },
  {
    id: '3',
    projectId: '2',
    type: 'INCOME',
    description: 'Segunda parcela - Projeto Jardins',
    amount: 250000,
    date: new Date(2024, 1, 1),
    category: 'Pagamento',
    status: 'PENDING',
    dueDate: new Date(2024, 2, 1),
  },
  {
    id: '4',
    projectId: '1',
    type: 'INCOME',
    description: 'Segunda parcela - Projeto Vila Nova',
    amount: 300000,
    date: new Date(2024, 2, 1),
    category: 'Pagamento',
    status: 'PENDING',
    dueDate: new Date(2024, 2, 15),
  },
];

export default function FinancePage() {
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleEditTransaction = (transactionId: string) => {
    // Implementar edição de transação
    console.log('Editar transação:', transactionId);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    // Implementar exclusão de transação
    console.log('Excluir transação:', transactionId);
  };

  const filteredTransactions = selectedProject
    ? mockTransactions.filter(t => t.projectId === selectedProject)
    : mockTransactions;

  const selectedProjectData = selectedProject
    ? mockProjects.find(p => p.id === selectedProject)
    : null;

  // Encontrar pagamentos pendentes próximos do vencimento (próximos 30 dias)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingPayments = mockTransactions
    .filter(t => 
      t.type === 'INCOME' &&
      t.status === 'PENDING' &&
      t.dueDate &&
      t.dueDate >= today &&
      t.dueDate <= thirtyDaysFromNow
    )
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  const totalUpcoming = upcomingPayments.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Financeiro
      </Typography>

      {upcomingPayments.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Pagamentos Próximos do Vencimento</AlertTitle>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Total a receber: {totalUpcoming.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Typography>
            {upcomingPayments.map(payment => (
              <Typography key={payment.id} variant="body2">
                • {payment.description} - Vencimento: {payment.dueDate?.toLocaleDateString()} - {
                  payment.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })
                }
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Projeto</InputLabel>
                <Select
                  value={selectedProject}
                  label="Filtrar por Projeto"
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <MenuItem value="">Todos os Projetos</MenuItem>
                  {mockProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FinancialList
              budget={selectedProjectData?.budget || 0}
              transactions={filteredTransactions}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 