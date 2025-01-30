'use client';

import { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Divider
} from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks } from '@/contexts/TaskContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectContext';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const priorityOrder = {
  'HIGH': 1,
  'MEDIUM': 2,
  'NORMAL': 3
};

const priorityColors = {
  'HIGH': '#dc3545',
  'MEDIUM': '#fd7e14',
  'NORMAL': '#198754'
};

const priorityLabels = {
  'HIGH': 'Alta',
  'MEDIUM': 'Média',
  'NORMAL': 'Normal'
};

export default function WeeklyCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { members } = useTeamContext();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    deadline: format(new Date(), 'yyyy-MM-dd'),
    priority: 'NORMAL',
    status: 'PENDING'
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const tasksByDay = useMemo(() => {
    const taskMap = new Map();
    weekDays.forEach(day => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        const compareDate = new Date(format(day, 'yyyy-MM-dd') + 'T00:00:00');
        return isSameDay(taskDate, compareDate);
      }).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      taskMap.set(day, dayTasks);
    });
    return taskMap;
  }, [tasks, weekDays]);

  const handlePreviousWeek = () => {
    setSelectedDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7));
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Não atribuído';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Sem projeto';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#0dcaf0';
      case 'IN_PROGRESS':
        return '#6f42c1';
      case 'PENDING':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assignedTo: task.assignedTo,
        date: task.date,
        deadline: task.deadline,
        priority: task.priority,
        status: task.status
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: '',
      assignedTo: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      deadline: format(new Date(), 'yyyy-MM-dd'),
      priority: 'NORMAL',
      status: 'PENDING'
    });
  };

  const handleSaveTask = () => {
    const taskToSave = {
      ...formData,
      date: format(new Date(formData.date + 'T00:00:00'), 'yyyy-MM-dd'),
      deadline: format(new Date(formData.deadline + 'T00:00:00'), 'yyyy-MM-dd')
    };

    if (editingTask) {
      updateTask({
        ...editingTask,
        ...taskToSave
      });
    } else {
      addTask({
        ...taskToSave,
        id: crypto.randomUUID()
      });
    }
    handleCloseDialog();
  };

  const handleMenuClick = (event, task) => {
    event.stopPropagation();
    setEditingTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setEditingTask(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    handleOpenDialog(editingTask);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      deleteTask(editingTask.id);
    }
    handleMenuClose();
  };

  const handleCompleteTask = () => {
    if (editingTask) {
      updateTask({
        ...editingTask,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {format(weekDays[0], "dd 'de' MMMM", { locale: ptBR })} - {format(weekDays[6], "dd 'de' MMMM", { locale: ptBR })}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Nova Tarefa
        </Button>
      </Box>

      <Grid container spacing={2}>
        {weekDays.map(day => (
          <Grid item xs key={day.toISOString()}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%',
                minHeight: '300px',
                backgroundColor: isSameDay(day, new Date()) ? 'action.hover' : 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                align="center"
                sx={{ 
                  textTransform: 'capitalize',
                  color: 'text.secondary'
                }}
              >
                {format(day, 'EEEE', { locale: ptBR })}
              </Typography>
              <Typography 
                variant="h5" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: isSameDay(day, new Date()) ? 'primary.main' : 'text.primary'
                }}
              >
                {format(day, 'dd')}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {tasksByDay.get(day)?.map(task => (
                  <Paper
                    key={task.id}
                    elevation={0}
                    sx={{
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeft: '4px solid',
                      borderLeftColor: priorityColors[task.priority],
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {task.title}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuClick(e, task)}
                        sx={{ ml: 1, mt: -0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {task.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={getProjectName(task.projectId)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={getMemberName(task.assignedTo)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={task.status}
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          backgroundColor: getStatusColor(task.status),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Título"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <FormControl fullWidth>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={formData.projectId}
                label="Projeto"
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={formData.assignedTo}
                label="Responsável"
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              >
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Data"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Prazo"
              type="date"
              fullWidth
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={formData.priority}
                label="Prioridade"
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="HIGH">Alta</MenuItem>
                <MenuItem value="MEDIUM">Média</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                <MenuItem value="COMPLETED">Concluída</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 150,
          }
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleCompleteTask} sx={{ color: 'success.main' }}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Marcar como Concluída
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
} 