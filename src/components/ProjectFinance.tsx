'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon, 
  CheckCircle as PaidIcon, 
  PendingOutlined as PendingIcon 
} from '@mui/icons-material';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  installmentCount: number;
  paymentMethod: string;
  endDate: string;
  installments?: Installment[];
}

interface Installment {
  id: string;
  number: number;
  dueDate: string;
  value: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentDate?: string;
}

export default function ProjectFinance() {
  const { 
    projectId,
    projectFinances, 
    addFinanceTransaction, 
    updateFinanceTransaction, 
    deleteFinanceTransaction
  } = useProjectDetails();
  const { projects, updateProject } = useProjects();
  const { members } = useTeamContext();
  const currentProject = projects.find(p => p.id === projectId) as Project | undefined;

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  const handleOpenDialog = (transaction?: any) => {
    if (transaction) {
      setEditingTransaction(transaction);
    } else {
      setEditingTransaction({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        type: 'EXPENSE'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = () => {
    if (editingTransaction.id) {
      updateFinanceTransaction(editingTransaction);
    } else {
      addFinanceTransaction({
        date: editingTransaction.date,
        description: editingTransaction.description,
        amount: Number(editingTransaction.amount),
        type: editingTransaction.type
      });
    }
    handleCloseDialog();
  };

  // Gerar parcelas quando o projeto for criado ou atualizado
  useEffect(() => {
    if (currentProject) {
      console.log('Projeto atual:', currentProject);
      const totalBudget = currentProject.budget;
      const currentInstallments = currentProject.installments || [];
      
      if (currentProject.paymentMethod === 'parcelado') {
        const installmentCount = currentProject.installmentCount || 1;
        console.log('Gerando parcelas:', { installmentCount, totalBudget });
        
        let remainingAmount = totalBudget;
        
        // Gerar as parcelas de acordo com o número de parcelas definido
        const generatedInstallments = Array.from({ length: installmentCount }, (_, index) => {
          const isLastInstallment = index === installmentCount - 1;
          let installmentAmount;
          
          if (isLastInstallment) {
            installmentAmount = remainingAmount;
          } else {
            installmentAmount = Math.floor((totalBudget / installmentCount) * 100) / 100;
            remainingAmount -= installmentAmount;
          }

          const dueDate = new Date(currentProject.endDate ? currentProject.endDate : new Date());
          dueDate.setMonth(dueDate.getMonth() + index);
          
          // Tentar manter o status e data de pagamento de parcelas existentes
          const existingInstallment = currentInstallments.find(inst => inst.number === index + 1);

          if (existingInstallment && existingInstallment.status === 'PAID') {
            // Se a parcela existe e está paga, mantemos o status e a data de pagamento
            return {
              ...existingInstallment,
              value: installmentAmount,
              dueDate: existingInstallment.dueDate
            };
          } else {
            // Se é uma nova parcela ou não está paga
            return {
              id: crypto.randomUUID(),
              number: index + 1,
              dueDate: dueDate.toISOString().split('T')[0],
              value: installmentAmount,
              status: 'PENDING'
            };
          }
        });

        console.log('Parcelas geradas:', generatedInstallments);
        setInstallments(generatedInstallments);
        
        if (JSON.stringify(currentProject.installments) !== JSON.stringify(generatedInstallments)) {
          console.log('Atualizando projeto com novas parcelas');
          updateProject({
            ...currentProject,
            installments: generatedInstallments
          });
        }
      } else {
        // Se for pagamento à vista, criar uma única parcela
        const dueDate = new Date(currentProject.endDate ? currentProject.endDate : new Date());
        
        // Tentar manter o status da primeira parcela se existir
        const existingInstallment = currentInstallments[0];

        const singleInstallment = existingInstallment && existingInstallment.status === 'PAID' ? {
          ...existingInstallment,
          value: totalBudget,
          number: 1,
          dueDate: existingInstallment.dueDate
        } : {
          id: crypto.randomUUID(),
          number: 1,
          dueDate: dueDate.toISOString().split('T')[0],
          value: totalBudget,
          status: 'PENDING'
        };

        console.log('Parcela única gerada:', singleInstallment);
        setInstallments([singleInstallment]);
        
        if (JSON.stringify(currentProject.installments) !== JSON.stringify([singleInstallment])) {
          console.log('Atualizando projeto com parcela única');
          updateProject({
            ...currentProject,
            installments: [singleInstallment]
          });
        }
      }
    }
  }, [currentProject]);

  // Calcular resumo financeiro
  const financialSummary = {
    total: currentProject?.budget || 0,
    received: installments.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.value, 0),
    toReceive: installments.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.value, 0),
    overdue: installments.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.value, 0)
  };

  const handleUpdateInstallmentStatus = (installment: Installment, newStatus: 'PENDING' | 'PAID') => {
    console.log('Projeto atual:', currentProject);
    console.log('Installments do projeto:', currentProject?.installments);
    console.log('Installments local:', installments);

    if (!currentProject) {
      console.error('Projeto não encontrado');
      return;
    }

    const updatedInstallments = installments.map(inst => 
      inst.id === installment.id 
        ? { 
            ...inst, 
            status: newStatus,
            paymentDate: newStatus === 'PAID' ? new Date().toISOString() : undefined
          } 
        : inst
    );

    console.log('Parcelas atualizadas:', updatedInstallments);
    setInstallments(updatedInstallments);

    const updatedProject = {
      ...currentProject,
      installments: updatedInstallments
    };

    console.log('Projeto atualizado:', updatedProject);
    updateProject(updatedProject);
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5">Financeiro do Projeto</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <MoneyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              Valor Total
            </Typography>
            <Typography variant="h5" color="primary">
              {financialSummary.total.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PaidIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              Recebido
            </Typography>
            <Typography variant="h5" color="success">
              {financialSummary.received.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              A Receber
            </Typography>
            <Typography variant="h5" color="warning">
              {financialSummary.toReceive.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <MoneyIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              Atrasado
            </Typography>
            <Typography variant="h5" color="error">
              {financialSummary.overdue.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          <Typography variant="h6">
            {currentProject?.paymentMethod === 'parcelado' ? 'Parcelas do Projeto' : 'Pagamento à Vista'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentProject?.paymentMethod === 'parcelado' 
              ? `Total de Parcelas: ${installments.length}`
              : 'Pagamento Único'}
          </Typography>
        </Box>
        {installments.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {currentProject?.paymentMethod === 'parcelado' ? 'Parcela' : 'Pagamento'}
                  </TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>
                      {currentProject?.paymentMethod === 'parcelado' 
                        ? `${installment.number}ª Parcela`
                        : 'Pagamento à Vista'}
                    </TableCell>
                    <TableCell>
                      {installment.value.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(installment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          installment.status === 'PAID' ? 'Pago' : 
                          installment.status === 'PENDING' ? 'Pendente' : 
                          'Atrasado'
                        }
                        color={
                          installment.status === 'PAID' ? 'success' : 
                          installment.status === 'PENDING' ? 'warning' : 
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {installment.status === 'PENDING' && (
                        <Button 
                          variant="contained" 
                          color="success"
                          size="small"
                          onClick={() => handleUpdateInstallmentStatus(installment, 'PAID')}
                        >
                          Marcar como Pago
                        </Button>
                      )}
                      {installment.status === 'PAID' && (
                        <Button 
                          variant="contained" 
                          color="warning"
                          size="small"
                          onClick={() => handleUpdateInstallmentStatus(installment, 'PENDING')}
                        >
                          Reverter Pagamento
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', mb: 4 }}>
            <Typography color="text.secondary">
              Nenhum pagamento encontrado para este projeto.
            </Typography>
          </Paper>
        )}
      </>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Transações
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Nova Transação
        </Button>
      </Box>

      {projectFinances && projectFinances.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectFinances.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      color={transaction.type === 'INCOME' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: transaction.type === 'INCOME' ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}>
                    {Number(transaction.amount).toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenDialog(transaction)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => deleteFinanceTransaction(transaction.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nenhuma transação registrada para este projeto.
          </Typography>
        </Paper>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingTransaction?.id ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editingTransaction?.date || ''}
              onChange={(e) => setEditingTransaction((prev: any) => ({ 
                ...prev, 
                date: e.target.value 
              }))}
            />
            <TextField
              fullWidth
              label="Descrição"
              placeholder="Digite uma descrição para a transação"
              value={editingTransaction?.description || ''}
              onChange={(e) => setEditingTransaction((prev: any) => ({ 
                ...prev, 
                description: e.target.value 
              }))}
            />
            <TextField
              fullWidth
              label="Valor"
              type="number"
              placeholder="0,00"
              InputProps={{
                startAdornment: 'R$ ',
                inputProps: { min: 0, step: 0.01 }
              }}
              value={editingTransaction?.amount || ''}
              onChange={(e) => setEditingTransaction((prev: any) => ({ 
                ...prev, 
                amount: e.target.value 
              }))}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Transação</InputLabel>
              <Select
                value={editingTransaction?.type || 'EXPENSE'}
                label="Tipo de Transação"
                onChange={(e) => setEditingTransaction((prev: any) => ({ 
                  ...prev, 
                  type: e.target.value 
                }))}
              >
                <MenuItem value="INCOME">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Receita" 
                      size="small" 
                      color="success"
                      sx={{ minWidth: 80 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Entrada de dinheiro no projeto
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="EXPENSE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Despesa" 
                      size="small" 
                      color="error"
                      sx={{ minWidth: 80 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Saída de dinheiro do projeto
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTransaction}
            disabled={!editingTransaction?.description || !editingTransaction?.amount}
          >
            {editingTransaction?.id ? 'Atualizar' : 'Adicionar'} Transação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 