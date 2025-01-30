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
  Chip,
  Input,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTeamContext, TeamMember } from '../contexts/TeamContext';

const statusColors = {
  ACTIVE: '#4caf50',
  VACATION: '#ff9800',
  LEAVE: '#f44336',
};

const statusLabels = {
  ACTIVE: 'Ativo',
  VACATION: 'Em Férias',
  LEAVE: 'Licença',
};

const initialFormData = {
  name: '',
  role: '',
  email: '',
  phone: '',
  status: 'ACTIVE' as const,
  projects: [] as string[],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Função para gerar avatar com inicial
const generateInitialsAvatar = (name: string) => {
  // Pega a primeira letra do primeiro e do último nome
  const nameParts = name.trim().split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0].toUpperCase()}${nameParts[nameParts.length - 1][0].toUpperCase()}`
    : nameParts[0][0].toUpperCase();

  // Cria um avatar de texto com cores geradas a partir do nome
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  return `data:image/svg+xml;utf8,
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="${getColorFromName(name)}"/>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dy=".1em" 
        fill="white" 
        font-family="Inter, Roboto, Arial, sans-serif" 
        font-weight="500" 
        font-size="24"
      >
        ${initials}
      </text>
    </svg>`;
};

const verifyCloudinaryUploadPermissions = async (cloudName: string, uploadPreset: string) => {
  try {
    console.log('Iniciando verificação de permissões:', { cloudName, uploadPreset });

    // Verificações preliminares
    if (!cloudName) {
      console.error('Cloud Name não configurado');
      return false;
    }

    if (!uploadPreset) {
      console.error('Upload Preset não configurado');
      return false;
    }

    // Teste de upload com uma imagem de exemplo
    const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
    const response = await fetch(testImageUrl)
      .then(res => res.blob());

    const formData = new FormData();
    formData.append('file', response, 'test.png');
    formData.append('upload_preset', uploadPreset);

    console.log('Preparando requisição de upload de teste');
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    console.log('Resposta do upload de teste:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Erro de permissão no Cloudinary:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        errorText
      });

      // Mensagens de erro mais específicas
      if (uploadResponse.status === 401) {
        console.error('Erro de autenticação. Verifique suas credenciais do Cloudinary.');
      } else if (uploadResponse.status === 403) {
        console.error('Erro de autorização. Verifique as configurações do preset de upload.');
      }

      return false;
    }

    const result = await uploadResponse.json();
    console.log('Resultado do upload de teste:', result);
    return !!result.secure_url;
  } catch (error) {
    console.error('Erro completo ao verificar permissões do Cloudinary:', error);
    
    // Verificações adicionais de erro
    if (error instanceof TypeError) {
      console.error('Erro de rede. Verifique sua conexão com a internet.');
    }

    return false;
  }
};

interface TeamListProps {
  projectId?: string;
}

export default function TeamList({ projectId }: TeamListProps) {
  const { members, addMember, updateMember, deleteMember } = useTeamContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    status: 'ACTIVE'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtrar membros do projeto atual se projectId for fornecido
  const projectMembers = projectId 
    ? members.filter(member => member.projectId === projectId)
    : members;

  const handleOpenDialog = (member?: any) => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        status: member.status
      });
      setEditingId(member.id);
    } else {
      setFormData({
        name: '',
        role: '',
        status: 'ACTIVE'
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      role: '',
      status: 'ACTIVE'
    });
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      updateMember({
        ...formData,
        id: editingId,
        projectId
      });
    } else {
      addMember({
        ...formData,
        id: crypto.randomUUID(),
        projectId,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      });
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Equipe do Projeto</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Adicionar Membro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Membro</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={member.avatar} alt={member.name} />
                    {member.name}
                  </Box>
                </TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <Chip
                    label={member.status === 'ACTIVE' ? 'Ativo' : 'Em Férias'}
                    color={member.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(member)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteMember(member.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Função"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="ACTIVE">Ativo</MenuItem>
                <MenuItem value="VACATION">Em Férias</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 