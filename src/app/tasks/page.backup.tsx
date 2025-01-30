'use client';

import React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTaskContext, TaskProvider } from '../../contexts/TaskContext';
import { useTeamContext, TeamProvider } from '../../contexts/TeamContext';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TaskList from '../../components/TaskList';

const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  DELAYED: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  DELAYED: 'Atrasada',
};

const priorityColors = {
  LOW: '#4caf50',
  MEDIUM: '#ff9800',
  HIGH: '#f44336',
};

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const initialFormData = {
  title: '',
  description: '',
  status: 'PENDING' as const,
  priority: 'MEDIUM' as const,
  dueDate: '',
  assignedTo: '',
  project: ''
};

export default function TasksPage() {
  return (
    <TeamProvider>
      <TaskProvider>
        <TasksContent />
      </TaskProvider>
    </TeamProvider>
  );
}

function TasksContent() {
  const router = useRouter();
  const {
    tasks,
    formData,
    editingTask,
    isDialogOpen,
    setFormData,
    setEditingTask,
    setIsDialogOpen,
    addTask,
    updateTask,
    deleteTask
  } = useTaskContext();
  const { members } = useTeamContext();

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Obter lista única de projetos
  const projects = useMemo(() => {
    const projectSet = new Set<string>();
    tasks.forEach(task => {
      if (task.project) {
        projectSet.add(task.project);
      }
    });
    return Array.from(projectSet);
  }, [tasks]);

  // Filtrar tarefas por projeto e membro
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchProject = !selectedProject || task.project === selectedProject;
      const matchMember = !selectedMember || task.assignedTo === selectedMember;
      const searchMatch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase());
      return matchProject && matchMember && searchMatch;
    });
  }, [tasks, selectedProject, selectedMember, searchTerm]);

  const handleInputChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSaveTask = () => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      assignedTo: '',
      project: '',
      dueDate: '',
    });
  };

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ position: 'relative', mb: 4 }}>
        <IconButton 
          onClick={handleBackClick} 
          sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ width: '100%' }}
        >
          Tarefas
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
          <TextField
            fullWidth
            label="Buscar tarefas"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, descrição ou projeto"
            size="small"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Projeto</InputLabel>
            <Select
              value={selectedProject}
              label="Filtrar por Projeto"
              onChange={(e) => setSelectedProject(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos os Projetos</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project} value={project}>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Nova Tarefa
        </Button>
      </Box>

      <TaskList 
        tasks={filteredTasks}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título"
              fullWidth
              value={formData.title}
              onChange={handleInputChange('title')}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
            />
            <FormControl fullWidth>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={formData.project}
                label="Projeto"
                onChange={handleInputChange('project')}
              >
                {projects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={formData.assignedTo}
                label="Responsável"
                onChange={handleInputChange('assignedTo')}
              >
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleInputChange('status')}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                <MenuItem value="COMPLETED">Concluída</MenuItem>
                <MenuItem value="DELAYED">Atrasada</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={formData.priority}
                label="Prioridade"
                onChange={handleInputChange('priority')}
              >
                <MenuItem value="LOW">Baixa</MenuItem>
                <MenuItem value="MEDIUM">Média</MenuItem>
                <MenuItem value="HIGH">Alta</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data de Entrega"
              type="date"
              fullWidth
              value={formData.dueDate}
              onChange={handleInputChange('dueDate')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 