'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import ProjectDetails from './ProjectDetails';
import { FinanceProvider, useFinanceContext } from '../contexts/FinanceContext';

interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  budget: number;
  status: 'BUDGET_IN_PROGRESS' | 'BUDGET_SENT' | 'BUDGET_APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  paymentMethod: 'pix' | 'cartao';
  installments: number;
}

const initialFormData: Omit<Project, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  clientId: '',
  budget: 0,
  status: 'BUDGET_IN_PROGRESS',
  paymentMethod: 'pix',
  installments: 1,
};

// Dados de exemplo - depois serão substituídos por dados do banco
const mockClients = [
  { id: '1', name: 'João Silva', email: 'joao@exemplo.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@exemplo.com' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@exemplo.com' },
  { id: '4', name: 'Empresa ABC', email: 'contato@abc.com' },
];

const mockProjects = [
  {
    id: '1',
    title: 'Residencial Vila Nova',
    description: 'Projeto residencial completo com 5 etapas de execução',
    clientId: '1',
    budget: 850000,
    status: 'IN_PROGRESS',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Comercial Centro',
    description: 'Projeto comercial com 4 fases de implementação',
    clientId: '2',
    budget: 1200000,
    status: 'IN_PROGRESS',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    title: 'Residencial Jardins',
    description: 'Projeto residencial com 3 etapas principais',
    clientId: '3',
    budget: 450000,
    status: 'BUDGET_APPROVED',
    createdAt: '2025-01-05',
  },
  {
    id: '4',
    title: 'Edifício Corporativo',
    description: 'Projeto corporativo de grande porte com 5 fases',
    clientId: '4',
    budget: 2000000,
    status: 'BUDGET_APPROVED',
    createdAt: '2025-02-01',
  },
];

const statusColors = {
  BUDGET_IN_PROGRESS: '#9c27b0',
  BUDGET_SENT: '#ff5722',
  BUDGET_APPROVED: '#795548',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
};

const statusText = {
  BUDGET_IN_PROGRESS: 'Orçamento em Elaboração',
  BUDGET_SENT: 'Orçamento Enviado',
  BUDGET_APPROVED: 'Orçamento Aprovado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
};

export default function ProjectList() {
  const [projects, setProjects] = useState(mockProjects);
  const { setTransactions } = useFinanceContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const years = Array.from(
    new Set(projects.map((project) => new Date(project.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

  const filteredProjects = projects.filter((project) => {
    const projectYear = new Date(project.createdAt).getFullYear();
    const matchesYear = projectYear === selectedYear;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockClients.find(client => client.id === project.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        budget: project.budget,
        status: project.status,
        paymentMethod: project.paymentMethod,
        installments: project.installments,
      });
      setEditingId(project.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleInputChange = (field: keyof typeof initialFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (editingId) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingId
            ? { ...project, ...formData }
            : project
        )
      );
    } else {
      const newProject = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Criar transações para as parcelas
      const installmentValue = formData.budget / formData.installments;
      const transactions = Array.from({ length: formData.installments }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() + index);
        return {
          id: Math.random().toString(36).substr(2, 9),
          project: formData.title,
          type: 'INCOME',
          amount: installmentValue,
          status: 'PENDING',
          installmentNumber: index + 1,
          dueDate: date.toISOString().split('T')[0],
        };
      });

      // Adicionar as transações ao contexto financeiro
      setTransactions(prev => [...prev, ...transactions]);
      setProjects((prev) => [...prev, newProject]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const getClientName = (clientId: string) => {
    return mockClients.find((client) => client.id === clientId)?.name || 'Cliente não encontrado';
  };

  const handleOpenViewDialog = (project: Project) => {
    const projectWithClientName = {
      ...project,
      clientName: getClientName(project.clientId),
    };
    setSelectedProject(projectWithClientName);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedProject(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              label="Ano"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Projeto
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} key={project.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Cliente: {getClientName(project.clientId)}
                  </Typography>
                  <Typography variant="body2">{project.description}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data de Criação: {format(new Date(project.createdAt), 'dd/MM/yyyy')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: statusColors[project.status],
                        fontWeight: 'bold',
                        mt: 1,
                      }}
                    >
                      Status: {statusText[project.status]}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenViewDialog(project)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(project)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(project.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título do Projeto"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.clientId}
                    label="Cliente"
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                  >
                    {mockClients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor do Orçamento"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Forma de Pagamento"
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  >
                    <MenuItem value="pix">PIX</MenuItem>
                    <MenuItem value="cartao">Cartão</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Número de Parcelas</InputLabel>
                  <Select
                    value={formData.installments}
                    label="Número de Parcelas"
                    onChange={(e) => handleInputChange('installments', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <MenuItem key={num} value={num}>{num}x</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="BUDGET_IN_PROGRESS">Orçamento em Elaboração</MenuItem>
                    <MenuItem value="BUDGET_SENT">Orçamento Enviado</MenuItem>
                    <MenuItem value="BUDGET_APPROVED">Orçamento Aprovado</MenuItem>
                    <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                    <MenuItem value="COMPLETED">Concluído</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {selectedProject && (
        <ProjectDetails
          open={openViewDialog}
          onClose={handleCloseViewDialog}
          project={selectedProject}
        />
      )}
    </>
  );
} 