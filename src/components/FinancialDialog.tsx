'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
} from '@mui/material';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { useState, useEffect } from 'react';
import { Transaction } from '@/types/finance';

export default function FinancialDialog() {
  const { isDialogOpen, setIsDialogOpen, editingTransaction, setEditingTransaction, addTransaction, updateTransaction } = useFinanceContext();
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: 'EXPENSE',
    status: 'PENDING',
    date: new Date().toISOString().split('T')[0],
    category: '',
    project: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        date: new Date(editingTransaction.date).toISOString().split('T')[0],
        dueDate: editingTransaction.dueDate 
          ? new Date(editingTransaction.dueDate).toISOString().split('T')[0]
          : undefined,
      });
    }
  }, [editingTransaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description?.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'O valor deve ser maior que zero';
    }
    
    if (!formData.category?.trim()) {
      newErrors.category = 'A categoria é obrigatória';
    }
    
    if (!formData.date) {
      newErrors.date = 'A data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const transactionData: Transaction = {
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
      description: formData.description!,
      amount: formData.amount!,
      type: formData.type!,
      status: formData.status!,
      date: formData.date!,
      category: formData.category!,
      project: formData.project,
      dueDate: formData.dueDate,
    };

    if (editingTransaction) {
      updateTransaction(transactionData);
    } else {
      addTransaction(transactionData);
    }

    handleClose();
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: 0,
      type: 'EXPENSE',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      category: '',
      project: '',
    });
    setErrors({});
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
          />

          <TextField
            label="Valor"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            error={!!errors.amount}
            helperText={errors.amount}
            fullWidth
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'COMPLETED' | 'OVERDUE' })}
            >
              <MenuItem value="PENDING">Pendente</MenuItem>
              <MenuItem value="COMPLETED">Pago</MenuItem>
              <MenuItem value="OVERDUE">Atrasado</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
          />

          <TextField
            label="Projeto (opcional)"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            fullWidth
          />

          <TextField
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Data de Vencimento (opcional)"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editingTransaction ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 