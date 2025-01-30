'use client';

import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Error as BlockedIcon,
  PlayArrow as InProgressIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo: string;
  dueDate: Date;
};

const statusIcons = {
  PENDING: <PendingIcon fontSize="small" />,
  IN_PROGRESS: <InProgressIcon fontSize="small" />,
  COMPLETED: <CheckIcon fontSize="small" />,
  BLOCKED: <BlockedIcon fontSize="small" />,
};

const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  BLOCKED: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  BLOCKED: 'Bloqueada',
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

interface TaskListProps {
  tasks: Task[];
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

export default function TaskList({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTask(taskId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    if (selectedTask && onEditTask) {
      onEditTask(selectedTask);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTask && onDeleteTask) {
      onDeleteTask(selectedTask);
    }
    handleMenuClose();
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (selectedTask && onStatusChange) {
      onStatusChange(selectedTask, newStatus);
    }
    handleMenuClose();
  };

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, color: statusColors[task.status] }}>
            {statusIcons[task.status]}
          </Box>
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                {task.title}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.secondary" component="span">
                  Responsável: {task.assignedTo}
                </Typography>
                <br />
                <Typography variant="body2" color="text.secondary" component="span">
                  Prazo: {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                </Typography>
              </>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <Chip
              label={statusLabels[task.status]}
              size="small"
              sx={{
                backgroundColor: `${statusColors[task.status]}20`,
                color: statusColors[task.status],
              }}
            />
            <Chip
              label={priorityLabels[task.priority]}
              size="small"
              sx={{
                backgroundColor: `${priorityColors[task.priority]}20`,
                color: priorityColors[task.priority],
              }}
            />
          </Box>
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={(e) => handleMenuOpen(e, task.id)}>
              <MoreIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('PENDING')}>Marcar como Pendente</MenuItem>
        <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>Marcar como Em Andamento</MenuItem>
        <MenuItem onClick={() => handleStatusChange('COMPLETED')}>Marcar como Concluída</MenuItem>
        <MenuItem onClick={() => handleStatusChange('BLOCKED')}>Marcar como Bloqueada</MenuItem>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Excluir</MenuItem>
      </Menu>
    </List>
  );
} 