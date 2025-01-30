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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as DetailsIcon,
  People as TeamIcon,
  Engineering as StagesIcon,
  AttachMoney as FinanceIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useProjects, Project, projectStatusLabels, projectStatusColors } from '../contexts/ProjectContext';
import { useTeamContext } from '../contexts/TeamContext';
import { ProjectDetailsProvider } from '@/contexts/ProjectDetailsContext';
import ProjectStages from '@/components/ProjectStages';
import ProjectFinance from '@/components/ProjectFinance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NumericFormat } from 'react-number-format';
import { useClientContext } from '@/contexts/ClientContext';
import ProjectTeam from '@/components/ProjectTeam';

const initialFormData: Omit<Project, 'id'> = {
  title: '',
  description: '',
  status: 'WAITING_START',
  endDate: '',
  priority: 'LOW',
  team: [],
  budget: 0,
  client: '',
  paymentMethod: 'vista',
  installments: 1,
  responsibleMember: ''
};

export default function ProjectList() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { members } = useTeamContext();
  const { clients } = useClientContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      const { id, ...projectData } = project;
      setFormData(projectData);
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

  const handleOpenDetailsDialog = (project: Project) => {
    setSelectedProject(project);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedProject(null);
    setActiveTab(0);
  };

  const handleInputChange = (field: keyof typeof initialFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const projectData = {
        ...formData,
        budget: Number(formData.budget),
        installmentCount: formData.paymentMethod === 'parcelado' ? Number(formData.installments) : 1,
        installments: [],
        createdAt: editingId ? projects.find(p => p.id === editingId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: formData.status || 'PENDING',
      };

      console.log('Salvando projeto:', projectData);

      if (editingId) {
        const currentProject = projects.find(p => p.id === editingId);
        const updatedProject = {
          ...currentProject,
          ...projectData,
          id: editingId,
        };
        console.log('Atualizando projeto:', updatedProject);
        await updateProject(updatedProject);
      } else {
        await addProject(projectData);
      }

      handleCloseDialog();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    if (!selectedProject) return null;

    switch(activeTab) {
      case 0:
        return <ProjectTeam />;
      case 1:
        return <ProjectStages />;
      case 2:
        return <ProjectFinance />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Projetos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Projeto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prazo para Entrega</TableCell>
              <TableCell>Orçamento</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={projectStatusLabels[project.status]} 
                    size="small" 
                    sx={{ 
                      bgcolor: `${projectStatusColors[project.status]}20`, 
                      color: projectStatusColors[project.status] 
                    }} 
                  />
                </TableCell>
                <TableCell>
                  {project.endDate 
                    ? format(parseISO(project.endDate), 'dd/MM/yyyy', { locale: ptBR }) 
                    : '-'}
                </TableCell>
                <TableCell>
                  {project.budget ? `R$ ${project.budget.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell>
                  {project.responsibleMember ? (
                    members.find(m => m.id === project.responsibleMember)?.name || '-'
                  ) : '-'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Detalhes do Projeto">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDetailsDialog(project)}
                    >
                      <DetailsIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleOpenDialog(project)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => deleteProject(project.id)} 
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Título do Projeto"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {Object.entries(projectStatusLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prazo para Entrega"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={formData.priority || 'LOW'}
                  label="Prioridade"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <MenuItem value="LOW">Baixa</MenuItem>
                  <MenuItem value="MEDIUM">Média</MenuItem>
                  <MenuItem value="HIGH">Alta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.client || ''}
                  label="Cliente"
                  onChange={(e) => handleInputChange('client', e.target.value)}
                >
                  <MenuItem value="">Selecione um cliente</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Método de Pagamento</InputLabel>
                <Select
                  value={formData.paymentMethod || 'vista'}
                  label="Método de Pagamento"
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  <MenuItem value="vista">À Vista</MenuItem>
                  <MenuItem value="parcelado">Parcelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.paymentMethod === 'parcelado' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Número de Parcelas"
                  value={formData.installments || 1}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(12, Number(e.target.value)));
                    handleInputChange('installments', value);
                  }}
                  inputProps={{ min: 1, max: 12 }}
                  helperText="Máximo de 12 parcelas"
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel shrink>Orçamento</InputLabel>
                <NumericFormat
                  customInput={TextField}
                  fullWidth
                  label="Orçamento"
                  value={formData.budget || 0}
                  onValueChange={(values) => {
                    handleInputChange('budget', values.floatValue || 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Responsável</InputLabel>
                <Select
                  value={formData.responsibleMember || ''}
                  label="Responsável"
                  onChange={(e) => handleInputChange('responsibleMember', e.target.value)}
                >
                  <MenuItem value="">Selecione um responsável</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descrição do Projeto"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="lg" 
        fullWidth
      >
        {selectedProject && (
          <ProjectDetailsProvider projectId={selectedProject.id}>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedProject.title}</Typography>
                <Chip
                  label={projectStatusLabels[selectedProject.status]}
                  size="small"
                  sx={{ 
                    bgcolor: `${projectStatusColors[selectedProject.status]}20`, 
                    color: projectStatusColors[selectedProject.status] 
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab icon={<TeamIcon />} label="Equipe" />
                  <Tab icon={<StagesIcon />} label="Etapas" />
                  <Tab icon={<FinanceIcon />} label="Financeiro" />
                </Tabs>
              </Box>
              
              {renderTabContent()}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Fechar</Button>
            </DialogActions>
          </ProjectDetailsProvider>
        )}
      </Dialog>
    </>
  );
} 