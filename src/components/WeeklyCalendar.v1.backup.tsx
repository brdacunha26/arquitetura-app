/**
 * WeeklyCalendar.v1.backup.tsx
 * Versão 1.0 do Calendário Semanal
 * 
 * Funcionalidades:
 * - Visualização semanal de tarefas (segunda a sexta)
 * - Cores por projeto (identificação visual)
 * - Indicadores de status (Pendente: Amarelo, Em Andamento: Azul, Concluída: Verde)
 * - CRUD completo de tarefas (Criar, Ler, Atualizar, Deletar)
 * - Menu de contexto para edição rápida
 * - Navegação entre semanas
 * 
 * Data: 2024
 */

'use client';

import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  project: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  date: Date;
}

interface WeeklyCalendarProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
  onDeleteTask?: (taskId: string) => void;
  teamMembers: { id: string; name: string }[];
  projects: { id: string; title: string }[];
}

// Cores predefinidas para projetos
const projectColors = [
  '#2196f3', // azul
  '#f44336', // vermelho
  '#4caf50', // verde
  '#ff9800', // laranja
  '#9c27b0', // roxo
  '#009688', // teal
  '#795548', // marrom
  '#607d8b', // azul acinzentado
];

// Cores para os status das tarefas
const statusColors = {
  PENDING: '#ff9800', // amarelo
  IN_PROGRESS: '#2196f3', // azul
  COMPLETED: '#4caf50', // verde
};

// Ícones para os status
const statusIcons = {
  PENDING: PendingIcon,
  IN_PROGRESS: ScheduleIcon,
  COMPLETED: CheckCircleIcon,
};

export default function WeeklyCalendar({ 
  tasks, 
  onAddTask, 
  onUpdateTask,
  onDeleteTask,
  teamMembers, 
  projects 
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    project: '',
    status: 'PENDING' as const,
  });

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleTaskClick = (event: React.MouseEvent<HTMLDivElement>, task: Task) => {
    event.stopPropagation();
    setSelectedTask(task);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedTask) {
      setNewTask({
        title: selectedTask.title,
        assignedTo: selectedTask.assignedTo,
        project: selectedTask.project,
        status: selectedTask.status,
      });
      setSelectedDate(selectedTask.date);
      setIsEditing(true);
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedTask && onDeleteTask) {
      onDeleteTask(selectedTask.id);
    }
    handleMenuClose();
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (selectedTask && onUpdateTask) {
      onUpdateTask(selectedTask.id, { status: newStatus });
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({
      title: '',
      assignedTo: '',
      project: '',
      status: 'PENDING',
    });
    setSelectedDate(null);
    setIsEditing(false);
    setSelectedTask(null);
  };

  const handleSaveTask = () => {
    if (selectedDate) {
      if (isEditing && selectedTask && onUpdateTask) {
        onUpdateTask(selectedTask.id, {
          ...newTask,
          date: selectedDate,
        });
      } else {
        onAddTask({
          ...newTask,
          date: selectedDate,
        });
      }
      handleCloseDialog();
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => format(task.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getTeamMemberName = (id: string) => {
    return teamMembers.find(member => member.id === id)?.name || 'Não atribuído';
  };

  const getProjectTitle = (id: string) => {
    return projects.find(project => project.id === id)?.title || 'Sem projeto';
  };

  const getProjectColor = (projectId: string) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    return projectColors[projectIndex % projectColors.length];
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Calendário Semanal</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            {format(startDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
            {format(addDays(startDate, 4), "dd 'de' MMMM", { locale: ptBR })}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => {
          const date = addDays(startDate, index);
          const dayTasks = getTasksForDate(date);

          return (
            <Grid item xs={12} md key={index}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: '100%',
                  minHeight: 200,
                  backgroundColor: 'background.default',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    {format(date, "EEEE, dd", { locale: ptBR })}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ ml: 'auto' }}
                    onClick={() => handleAddTask(date)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dayTasks.map((task) => {
                    const projectColor = getProjectColor(task.project);
                    const StatusIcon = statusIcons[task.status];
                    return (
                      <Card
                        key={task.id}
                        onClick={(e) => handleTaskClick(e, task)}
                        sx={{
                          backgroundColor: `${projectColor}10`,
                          borderLeft: `4px solid ${projectColor}`,
                          cursor: 'pointer',
                          position: 'relative',
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '24px',
                            height: '24px',
                            backgroundColor: statusColors[task.status],
                            borderBottomLeftRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <StatusIcon sx={{ color: 'white', fontSize: '16px' }} />
                        </Box>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', pr: 3 }}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                            {getProjectTitle(task.project)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Resp: {getTeamMemberName(task.assignedTo)}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('PENDING')}>
          <ListItemIcon>
            <PendingIcon fontSize="small" sx={{ color: statusColors.PENDING }} />
          </ListItemIcon>
          <ListItemText>Marcar como Pendente</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" sx={{ color: statusColors.IN_PROGRESS }} />
          </ListItemIcon>
          <ListItemText>Marcar como Em Andamento</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('COMPLETED')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" sx={{ color: statusColors.COMPLETED }} />
          </ListItemIcon>
          <ListItemText>Marcar como Concluída</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Título da Tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Projeto"
              value={newTask.project}
              onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Responsável"
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            >
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Status"
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
            >
              <MenuItem value="PENDING">Pendente</MenuItem>
              <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
              <MenuItem value="COMPLETED">Concluída</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {isEditing ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 