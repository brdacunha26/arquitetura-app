'use client';

import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'ON_VACATION' | 'UNAVAILABLE';
};

const statusColors = {
  ACTIVE: '#4caf50',
  ON_VACATION: '#ff9800',
  UNAVAILABLE: '#f44336',
};

const statusLabels = {
  ACTIVE: 'Ativo',
  ON_VACATION: 'Em Férias',
  UNAVAILABLE: 'Indisponível',
};

interface TeamListProps {
  members: TeamMember[];
  onEditMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
  onContactMember?: (type: 'email' | 'phone', contact: string) => void;
}

export default function TeamList({
  members,
  onEditMember,
  onDeleteMember,
  onContactMember,
}: TeamListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMember(memberId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleEdit = () => {
    if (selectedMember && onEditMember) {
      onEditMember(selectedMember);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMember && onDeleteMember) {
      onDeleteMember(selectedMember);
    }
    handleMenuClose();
  };

  return (
    <List>
      {members.map((member) => (
        <ListItem
          key={member.id}
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar src={member.avatar} alt={member.name}>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{member.name}</Typography>
                <Chip
                  label={statusLabels[member.status]}
                  size="small"
                  sx={{
                    backgroundColor: `${statusColors[member.status]}20`,
                    color: statusColors[member.status],
                  }}
                />
              </Box>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.secondary">
                  {member.role}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  {member.email && (
                    <IconButton
                      size="small"
                      onClick={() => onContactMember?.('email', member.email!)}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  )}
                  {member.phone && (
                    <IconButton
                      size="small"
                      onClick={() => onContactMember?.('phone', member.phone!)}
                    >
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </>
            }
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={(e) => handleMenuOpen(e, member.id)}>
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
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remover
        </MenuItem>
      </Menu>
    </List>
  );
} 