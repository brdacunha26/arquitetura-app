'use client';

import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import BackButton from '@/components/BackButton';
import { useState } from 'react';
import { FinanceProvider, useFinanceContext } from '@/contexts/FinanceContext';
import { format } from 'date-fns';
import FinancialSummary from '@/components/FinancialSummary';
import ProtectedRoute from '@/components/ProtectedRoute';

function TransactionDialog() {
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    formData = {
      description: '',
      amount: '',
      type: 'INCOME',
      status: 'PENDING',
      date: format(new Date(), 'yyyy-MM-dd'),
      project: ''
    }, 
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
      date: format(new Date(), 'yyyy-MM-dd'),
      project: ''
    });
  };

  const handleSave = () => {
    const newTransaction = {
      id: editingTransaction?.id || String(Date.now()),
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type,
      status: formData.status === 'PAID' ? 'COMPLETED' : 
             formData.status === 'OVERDUE' ? 'OVERDUE' : 'PENDING',
      date: formData.date,
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
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Financeiro
        </Typography>
      </Box>

      <FinancialSummary />
      <TransactionDialog />
    </Container>
  );
}

function FinancePage() {
  return (
    <ProtectedRoute>
      <FinanceProvider>
        <FinancePageContent />
      </FinanceProvider>
    </ProtectedRoute>
  );
}

export default FinancePage; 