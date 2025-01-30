'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from '@mui/material';
import { format, startOfWeek, addDays, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks } from '@/contexts/TaskContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useTimeline } from '@/contexts/TimelineContext';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const priorityOrder = {
  'HIGH': 1,
  'MEDIUM': 2,
  'LOW': 3
};

const priorityColors = {
  'HIGH': '#dc3545',
  'MEDIUM': '#fd7e14',
  'LOW': '#198754'
};

const priorityLabels = {
  'HIGH': 'Alta',
  'MEDIUM': 'Média',
  'LOW': 'Normal'
};

const statusLabels = {
  'COMPLETED': 'Concluída',
  'IN_PROGRESS': 'Em Andamento',
  'PENDING': 'Pendente',
  'OVERDUE': 'Atrasada'
};

const statusColors = {
  'COMPLETED': '#0dcaf0',
  'IN_PROGRESS': '#6f42c1',
  'PENDING': '#ffc107',
  'OVERDUE': '#dc3545'
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
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    priority: 'MEDIUM',
    status: 'PENDING'
  });
  const { events } = useTimeline();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

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
      }).sort((a, b) => {
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (priorityOrder[a.priority || 'LOW'] - priorityOrder[b.priority || 'LOW']);
      });
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
      case 'OVERDUE':
        return '#dc3545';
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
      date: new Date().toISOString().split('T')[0],
      deadline: '',
      priority: 'MEDIUM',
      status: 'PENDING'
    });
  };

  const updateTasksStatus = () => {
    const today = new Date();
    const updatedTasks = tasks.map(task => {
      const deadline = new Date(task.deadline);
      
      if (task.status !== 'COMPLETED' && isBefore(deadline, today)) {
        return {
          ...task,
          status: 'OVERDUE'
        };
      }
      
      if (task.status === 'OVERDUE' && isAfter(deadline, today)) {
        return {
          ...task,
          status: 'PENDING'
        };
      }
      
      return task;
    });

    updatedTasks.forEach(task => {
      if (task.status !== tasks.find(t => t.id === task.id)?.status) {
        updateTask(task);
      }
    });
  };

  useEffect(() => {
    updateTasksStatus();
    const intervalId = setInterval(updateTasksStatus, 60000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  useEffect(() => {
    console.group('WeeklyCalendar: Eventos atualizados');
    console.log('Quantidade de eventos:', events.length);
    events.forEach((event, index) => {
      console.log(`Evento ${index + 1}:`, event);
    });
    console.groupEnd();
  }, [events]);

  const handleSaveTask = () => {
    const taskData = {
      ...formData,
      status: formData.status || 'PENDING'
    };

    if (editingTask) {
      updateTask({
        ...editingTask,
        ...taskData
      });
    } else {
      addTask(taskData);
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

  const handleOpenTimeline = () => {
    console.group('WeeklyCalendar: Abrindo diálogo de histórico');
    console.log('Eventos disponíveis:', events);
    console.log('Quantidade de eventos:', events.length);
    events.forEach((event, index) => {
      console.log(`Evento ${index + 1}:`, event);
    });
    console.groupEnd();
    setIsTimelineOpen(true);
  };

  const handleCloseTimeline = () => {
    setIsTimelineOpen(false);
  };

  const renderEventDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'TASK_CREATED':
        return `Nova tarefa criada: ${event.description}`;
      case 'TASK_UPDATED':
        return `Tarefa atualizada: ${event.description}`;
      case 'TASK_DELETED':
        return `Tarefa excluída: ${event.description}`;
      default:
        return event.description;
    }
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
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mt: 2 }}>
                {tasksByDay.get(day)?.map(task => (
                  <Paper
                    key={task.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderLeft: 3,
                      borderColor: priorityColors[task.priority || 'LOW'],
                      backgroundColor: 'background.default',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => handleOpenDialog(task)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
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
                    <Typography variant="caption" color="text.secondary" display="block">
                      {getProjectName(task.projectId)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <Chip
                        label={getMemberName(task.assignedTo)}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={statusLabels[task.status]}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          backgroundColor: statusColors[task.status],
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                label="Projeto"
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
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                label="Responsável"
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
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Prazo"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                label="Prioridade"
              >
                <MenuItem value="HIGH">Alta</MenuItem>
                <MenuItem value="MEDIUM">Média</MenuItem>
                <MenuItem value="LOW">Normal</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
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
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleCompleteTask}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Concluir
        </MenuItem>
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      <Dialog 
        open={isTimelineOpen} 
        onClose={handleCloseTimeline}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Histórico de Atividades
            <IconButton onClick={handleCloseTimeline}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {events.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                textAlign: 'center'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nenhuma atividade registrada ainda
              </Typography>
            </Box>
          ) : (
            <List>
              {events.map((event) => (
                <ListItem 
                  key={event.id} 
                  divider 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 2
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" color="primary">
                        {renderEventDescription(event)}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Por: {event.user}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Em: {format(parseISO(event.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </Typography>
                        {event.changes && event.changes.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                              Alterações:
                            </Typography>
                            {event.changes.map((change, index) => (
                              <Typography key={index} variant="body2" color="text.secondary">
                                • {change.field}: {change.oldValue || '(vazio)'} → {change.newValue || '(vazio)'}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 