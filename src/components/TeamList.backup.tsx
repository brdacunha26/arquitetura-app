'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
}

const initialFormData: Omit<TeamMember, 'id' | 'avatar'> = {
  name: '',
  role: '',
  email: '',
  phone: '',
};

// Dados de exemplo - depois serão substituídos por dados do banco
const mockTeamMembers = [
  {
    id: '1',
    name: 'Ana Silva',
    role: 'Arquiteta Sênior',
    email: 'ana.silva@exemplo.com',
    phone: '(11) 98765-4321',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Pedro Santos',
    role: 'Designer de Interiores',
    email: 'pedro.santos@exemplo.com',
    phone: '(11) 98765-4322',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
];

export default function TeamList() {
  const [members, setMembers] = useState(mockTeamMembers);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      const { avatar, id, ...memberData } = member;
      setFormData(memberData);
      setEditingId(id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleInputChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (editingId) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingId
            ? {
                ...member,
                ...formData,
              }
            : member
        )
      );
    } else {
      const newMember = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://i.pravatar.cc/150?img=${members.length + 1}`,
      };
      setMembers((prev) => [...prev, newMember]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Membro
        </Button>
      </Box>

      <Grid container spacing={3}>
        {members.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={member.avatar}
                  alt={member.name}
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(member)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(member.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Email: {member.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Telefone: {member.phone}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cargo"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 