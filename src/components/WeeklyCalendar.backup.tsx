'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, isSameDay, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const priorityColors = {
  LOW: '#4caf50',
  MEDIUM: '#ff9800',
  HIGH: '#f44336',
};

const projectColors = {
  'Residência Moderna Jardins': '#2196f3',
  'Retrofit Comercial Centro': '#4caf50',
  'Casa de Praia Contemporânea': '#ff9800',
  'Clínica Médica Premium': '#9c27b0',
  'Apartamento Alto Padrão': '#00bcd4',
};

const statusColors = {
  PENDING: '#ff9800', // Laranja para Aguardando Início
  IN_PROGRESS: '#2196f3', // Azul para Em Execução
  COMPLETED: '#4caf50', // Verde para Finalizado
  DELAYED: '#f44336', // Vermelho para Atrasado/Com Pendências
};

const statusLabels = {
  PENDING: 'Aguardando Início',
  IN_PROGRESS: 'Em Execução',
  COMPLETED: 'Finalizado',
  DELAYED: 'Com Pendências',
};

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  project: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
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

export default function WeeklyCalendar({ tasks, onAddTask, onUpdateTask, onDeleteTask, teamMembers, projects }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const weekDays = useMemo(() => {
    let start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Começa na segunda-feira
    return Array.from({ length: 5 }, (_, i) => addDays(start, i)); // Apenas 5 dias
  }, [selectedDate]);

  const handlePreviousWeek = () => {
    setSelectedDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7));
  };

  const handleAddTask = () => {
    onAddTask(newTask);
    setIsDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      project: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const tasksByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach(day => {
      grouped[format(day, 'yyyy-MM-dd')] = tasks.filter(task =>
        isSameDay(new Date(task.date), day)
      );
    });
    return grouped;
  }, [tasks, weekDays]);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo,
      project: task.project,
      status: task.status,
      priority: task.priority || 'MEDIUM',
      date: format(task.date, 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (task: Task) => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, task: Task) => {
    event.stopPropagation();
    setSelectedTask(task);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTask(null);
  };

  const handleSaveTask = () => {
    if (editingTask) {
      const taskDate = new Date(newTask.date + 'T12:00:00');
      
      const updatedTask = {
        ...editingTask,
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo,
        project: newTask.project,
        status: newTask.status,
        priority: newTask.priority,
        date: taskDate
      };
      onUpdateTask?.(editingTask.id, updatedTask);
    } else {
      const taskDate = new Date(newTask.date + 'T12:00:00');
      onAddTask({
        ...newTask,
        date: taskDate
      });
    }
    setIsDialogOpen(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      project: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {format(weekDays[0], "dd 'de' MMMM", { locale: ptBR })} - {format(weekDays[4], "dd 'de' MMMM", { locale: ptBR })}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          size="small"
        >
          Nova Tarefa
        </Button>
      </Box>

      <Grid container spacing={1}>
        {weekDays.map(day => (
          <Grid item xs key={day.toISOString()}>
            <Paper
              sx={{
                p: 1,
                height: '100%',
                bgcolor: isSameDay(day, new Date()) ? 'action.hover' : 'background.paper',
                minHeight: 200,
              }}
            >
              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  mb: 1,
                  color: isSameDay(day, new Date()) ? 'primary.main' : 'text.primary',
                  fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                }}
              >
                {format(day, 'EEE, dd', { locale: ptBR })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tasksByDay[format(day, 'yyyy-MM-dd')]?.map(task => (
                  <Paper
                    key={task.id}
                    sx={{
                      p: 1,
                      bgcolor: `${projectColors[task.project]}10`,
                      borderLeft: `3px solid ${projectColors[task.project]}`,
                      position: 'relative',
                      '&:hover': {
                        bgcolor: `${projectColors[task.project]}20`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 'medium', flex: 1 }}>
                        {task.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, task);
                        }}
                        sx={{ ml: 1, p: 0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Tooltip title="Responsável">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {task.assignedTo}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label={statusLabels[task.status]}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: `${statusColors[task.status]}20`,
                          color: statusColors[task.status],
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

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedTask && handleEditClick(selectedTask)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleDeleteClick(selectedTask)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={isDialogOpen} onClose={() => {
        setIsDialogOpen(false);
        setEditingTask(null);
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          project: '',
          status: 'PENDING',
          priority: 'MEDIUM',
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={newTask.project}
                label="Projeto"
                onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.title}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={newTask.assignedTo}
                label="Responsável"
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newTask.status}
                label="Status"
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <MenuItem value="PENDING">Aguardando Início</MenuItem>
                <MenuItem value="IN_PROGRESS">Em Execução</MenuItem>
                <MenuItem value="COMPLETED">Finalizado</MenuItem>
                <MenuItem value="DELAYED">Com Pendências</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={newTask.priority}
                label="Prioridade"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <MenuItem value="LOW">Baixa</MenuItem>
                <MenuItem value="MEDIUM">Média</MenuItem>
                <MenuItem value="HIGH">Alta</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data"
              type="date"
              fullWidth
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setEditingTask(null);
          }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveTask} variant="contained">
            {editingTask ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 