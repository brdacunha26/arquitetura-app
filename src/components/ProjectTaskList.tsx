'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Task, statusLabels, statusColors } from '@/contexts/TaskContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectTaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function ProjectTaskList({ tasks, onEdit, onDelete }: ProjectTaskListProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleEdit = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      onEdit(task);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTaskId) {
      onDelete(selectedTaskId);
    }
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tasks.map((task) => (
        <Card key={task.id} sx={{ 
          position: 'relative',
          '&:hover': {
            boxShadow: 3,
          },
        }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {task.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task.id)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label={statusLabels[task.status]}
                    variant="filled"
                    color={
                      task.status === 'COMPLETED' ? 'success' :
                      task.status === 'IN_PROGRESS' ? 'primary' :
                      task.status === 'DELAYED' ? 'error' :
                      task.status === 'CANCELLED' ? 'default' :
                      'warning'
                    }
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Responsável: {task.assignedTo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {format(new Date(task.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
} 