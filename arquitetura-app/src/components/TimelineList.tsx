'use client';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Task as TaskIcon,
  Description as DocumentIcon,
  Group as TeamIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Payment as PaymentIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useState } from 'react';

type TimelineEvent = {
  id: string;
  type: 'TASK' | 'DOCUMENT' | 'TEAM' | 'PAYMENT' | 'COMMENT';
  title: string;
  description: string;
  date: Date;
  status?: string;
  user?: string;
  amount?: number;
};

const eventIcons = {
  TASK: <TaskIcon />,
  DOCUMENT: <DocumentIcon />,
  TEAM: <TeamIcon />,
  PAYMENT: <PaymentIcon />,
  COMMENT: <CommentIcon />,
};

const eventColors = {
  TASK: '#2196f3',
  DOCUMENT: '#4caf50',
  TEAM: '#ff9800',
  PAYMENT: '#9c27b0',
  COMMENT: '#607d8b',
};

interface TimelineListProps {
  events: TimelineEvent[];
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export default function TimelineList({
  events,
  onEditEvent,
  onDeleteEvent,
}: TimelineListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEvent(eventId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent && onEditEvent) {
      onEditEvent(selectedEvent);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedEvent && onDeleteEvent) {
      onDeleteEvent(selectedEvent);
    }
    handleMenuClose();
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Timeline position="right">
      {events.map((event) => (
        <TimelineItem key={event.id}>
          <TimelineOppositeContent color="text.secondary">
            <Typography variant="body2">
              {event.date.toLocaleDateString()}
              {' '}
              {event.date.toLocaleTimeString()}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ bgcolor: eventColors[event.type] }}>
              {eventIcons[event.type]}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" component="div">
                  {event.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, event.id)}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {event.description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                {event.status && (
                  <Chip
                    label={event.status}
                    size="small"
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}
                  />
                )}
                {event.user && (
                  <Typography variant="body2" color="text.secondary">
                    por {event.user}
                  </Typography>
                )}
                {event.amount && (
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(event.amount)}
                  </Typography>
                )}
              </Box>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
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
    </Timeline>
  );
} 