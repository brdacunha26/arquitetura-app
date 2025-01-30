'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TeamList from '@/components/TeamList';
import { useState } from 'react';

// Dados de exemplo - serão substituídos por dados do banco
const mockTeam = [
  {
    id: '1',
    name: 'Ana Silva',
    role: 'Arquiteta Principal',
    email: 'ana.silva@exemplo.com',
    phone: '(11) 98765-4321',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Carlos Santos',
    role: 'Designer de Interiores',
    email: 'carlos.santos@exemplo.com',
    phone: '(11) 98765-4322',
    status: 'ON_VACATION',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    role: 'Arquiteta Júnior',
    email: 'mariana.costa@exemplo.com',
    phone: '(11) 98765-4323',
    status: 'ACTIVE',
  },
];

export default function TeamPage() {
  const [openNewMemberDialog, setOpenNewMemberDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });

  const handleEditMember = (memberId: string) => {
    // Implementar edição de membro
    console.log('Editar membro:', memberId);
  };

  const handleDeleteMember = (memberId: string) => {
    // Implementar exclusão de membro
    console.log('Excluir membro:', memberId);
  };

  const handleContactMember = (type: 'email' | 'phone', contact: string) => {
    if (type === 'email') {
      window.location.href = `mailto:${contact}`;
    } else {
      window.location.href = `tel:${contact}`;
    }
  };

  const handleNewMember = () => {
    setOpenNewMemberDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenNewMemberDialog(false);
    setNewMember({
      name: '',
      role: '',
      email: '',
      phone: '',
      status: 'ACTIVE',
    });
  };

  const handleSaveMember = () => {
    // Aqui você implementaria a lógica para salvar o membro
    console.log('Novo membro:', newMember);
    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Equipe
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewMember}
        >
          Novo Funcionário
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Membros da Equipe
          </Typography>
        </Box>
        <TeamList
          members={mockTeam}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onContactMember={handleContactMember}
        />
      </Paper>

      {/* Diálogo para Novo Funcionário */}
      <Dialog open={openNewMemberDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Funcionário</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <TextField
              label="Cargo"
              fullWidth
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <TextField
              label="Telefone"
              fullWidth
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newMember.status}
                label="Status"
                onChange={(e) => setNewMember({ ...newMember, status: e.target.value })}
              >
                <MenuItem value="ACTIVE">Ativo</MenuItem>
                <MenuItem value="ON_VACATION">Em Férias</MenuItem>
                <MenuItem value="UNAVAILABLE">Indisponível</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveMember}
            variant="contained"
            disabled={!newMember.name || !newMember.email}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 