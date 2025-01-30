'use client';

import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import BackButton from '@/components/BackButton';
import { useState, useMemo } from 'react';
import FinancialList from '@/components/FinancialList';
import { FinanceProvider, useFinanceContext } from '@/contexts/FinanceContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';

function TransactionDialog() {
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    formData, 
    setFormData, 
    editingTransaction,
    setEditingTransaction,
    setTransactions 
  } = useFinanceContext();

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      type: 'INCOME',
      status: 'PENDING',
      date: '',
      project: ''
    });
  };

  const handleSave = () => {
    const newTransaction = {
      id: editingTransaction?.id || String(Date.now()),
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type,
      status: formData.status === 'PAID' ? 'COMPLETED' : formData.status === 'OVERDUE' ? 'CANCELLED' : 'PENDING',
      date: new Date(formData.date),
      project: formData.project || '',
      category: editingTransaction?.category || 'PAYMENT',
      budget: editingTransaction?.budget
    };

    setTransactions(prev => {
      if (editingTransaction) {
        return prev.map(t => t.id === editingTransaction.id ? newTransaction : t);
      }
      return [...prev, newTransaction];
    });

    handleClose();
  };

  return (
    <Dialog open={isDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Descrição"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          <TextField
            label="Valor"
            fullWidth
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              label="Tipo"
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'INCOME' | 'EXPENSE' }))}
            >
              <MenuItem value="INCOME">Receita</MenuItem>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'PENDING' | 'PAID' | 'OVERDUE' }))}
            >
              <MenuItem value="PENDING">Pendente</MenuItem>
              <MenuItem value="PAID">Pago</MenuItem>
              <MenuItem value="OVERDUE">Atrasado</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Data"
            type="date"
            fullWidth
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Projeto"
            fullWidth
            value={formData.project}
            onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FinancePageContent() {
  const { transactions } = useFinanceContext();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Obter lista única de anos das transações
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    // Adiciona o ano atual mesmo que não tenha transações
    yearsSet.add(currentYear);
    transactions.forEach(transaction => {
      yearsSet.add(transaction.date.getFullYear());
    });
    return Array.from(yearsSet).sort((a, b) => b - a); // Ordenar decrescente
  }, [transactions, currentYear]);

  // Obter lista única de projetos filtrados por ano
  const filteredProjects = useMemo(() => {
    const projectsSet = new Set<string>();
    transactions
      .filter(t => t.date.getFullYear() === selectedYear)
      .forEach(transaction => {
        if (transaction.project) {
          projectsSet.add(transaction.project);
        }
      });
    return Array.from(projectsSet).sort();
  }, [transactions, selectedYear]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', py: 4 }}>
      <BackButton />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Financeiro
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select
                value={selectedYear}
                label="Ano"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={selectedProject}
                label="Projeto"
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <MenuItem value="">Todos os Projetos</MenuItem>
                {filteredProjects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <FinancialList 
          budget={1000000} 
          selectedYear={selectedYear}
          selectedProject={selectedProject}
        />
        <TransactionDialog />
      </Container>
    </Box>
  );
}

export default function FinancePage() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <FinanceProvider>
        <FinancePageContent />
      </FinanceProvider>
    </LocalizationProvider>
  );
} 