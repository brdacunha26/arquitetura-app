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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Assignment as ProjectIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Task, statusLabels, statusColors } from '@/contexts/TaskContext';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/contexts/ProjectContext';
import ProjectDetails from './ProjectDetails';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const { projects } = useProjects();

  const isOverdue = (deadline: string) => {
    return isBefore(new Date(deadline), new Date()) && !isAfter(new Date(deadline), new Date());
  };

  // Ordenar tarefas por prazo
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sortedTasks.map((task) => (
        <Card 
          key={task.id} 
          sx={{ 
            position: 'relative',
            '&:hover': {
              boxShadow: 3,
            },
            borderLeft: '4px solid',
            borderLeftColor: statusColors[task.status],
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Tooltip title={task.source === 'calendar' ? 'Tarefa do Calendário' : 'Etapa do Projeto'}>
                    {task.source === 'calendar' ? <EventIcon color="primary" /> : <ProjectIcon color="secondary" />}
                  </Tooltip>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {task.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={statusLabels[task.status]}
                      sx={{
                        bgcolor: `${statusColors[task.status]}15`,
                        color: statusColors[task.status],
                        fontWeight: 'medium',
                      }}
                    />
                    {isOverdue(task.deadline) && task.status !== 'COMPLETED' && (
                      <Tooltip title="Prazo vencido">
                        <WarningIcon color="error" />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Projeto: {task.project}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Responsável: {task.assignedTo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prazo: {format(new Date(task.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                  {task.completedAt && (
                    <Typography variant="body2" color="success.main">
                      Concluído em: {format(new Date(task.completedAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
} 