'use client';

import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  OpenInNew as OpenIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Project = {
  id: string;
  title: string;
  clientName: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  endDate: Date;
};

const statusColors = {
  PLANNING: '#2196f3',
  IN_PROGRESS: '#ff9800',
  REVIEW: '#9c27b0',
  COMPLETED: '#4caf50',
  ON_HOLD: '#f44336',
  CANCELLED: '#9e9e9e',
};

const statusLabels = {
  PLANNING: 'Planejamento',
  IN_PROGRESS: 'Em Andamento',
  REVIEW: 'Em Revisão',
  COMPLETED: 'Concluído',
  ON_HOLD: 'Em Espera',
  CANCELLED: 'Cancelado',
};

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
}

export default function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  return (
    <List>
      {projects.map((project) => (
        <ListItem
          key={project.id}
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <StatusIcon
              sx={{
                color: statusColors[project.status],
                fontSize: '12px',
                mr: 1,
              }}
            />
          </Box>
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                {project.title}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.secondary" component="span">
                  Cliente: {project.clientName}
                </Typography>
                <br />
                <Typography variant="body2" color="text.secondary" component="span">
                  Entrega: {format(new Date(project.endDate), "dd 'de' MMMM", { locale: ptBR })}
                </Typography>
              </>
            }
          />
          <ListItemSecondaryAction>
            <Chip
              label={statusLabels[project.status]}
              size="small"
              sx={{
                backgroundColor: `${statusColors[project.status]}20`,
                color: statusColors[project.status],
                mr: 1,
              }}
            />
            <IconButton
              edge="end"
              onClick={() => onProjectClick?.(project.id)}
              size="small"
            >
              <OpenIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
} 