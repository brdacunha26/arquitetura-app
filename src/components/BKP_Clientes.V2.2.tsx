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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  History as HistoryIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import MaskedInput from '@/components/MaskedInput';
import { format } from 'date-fns';
import { useClientContext, Client } from '@/contexts/ClientContext';
import { ptBR } from 'date-fns/locale';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const initialFormData: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

export default function ClientList() {
  const { clients, clientEvents, addClient, updateClient, deleteClient } = useClientContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      });
      setEditingId(client.id);
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

  const handleSave = () => {
    if (editingId) {
      updateClient({
        ...formData,
        id: editingId,
        createdAt: clients.find(c => c.id === editingId)?.createdAt || new Date().toISOString(),
      });
    } else {
      addClient(formData);
    }
    handleCloseDialog();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATE':
        return <CreateIcon color="success" />;
      case 'UPDATE':
        return <UpdateIcon color="info" />;
      case 'DELETE':
        return <DeleteIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />
          <IconButton 
            color="primary" 
            onClick={() => setOpenHistoryDialog(true)}
            title="Histórico de Ações"
          >
            <HistoryIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cliente
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredClients.map((client) => (
          <Grid item xs={12} key={client.id}>
            <Paper 
              sx={{ 
                p: 3,
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{client.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {client.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {client.address}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente desde: {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteClient(client.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Histórico de Ações</DialogTitle>
        <DialogContent>
          <List>
            {clientEvents.map((event) => (
              <ListItem key={event.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getEventIcon(event.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.description}
                    secondary={format(new Date(event.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  />
                </Box>
                {event.changes && event.changes.length > 0 && (
                  <Box sx={{ pl: 5, width: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Alterações:
                    </Typography>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <Box component="tbody">
                        {event.changes.map((change, index) => (
                          <Box
                            component="tr"
                            key={index}
                            sx={{
                              '& td': {
                                p: 1,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              },
                            }}
                          >
                            <Box component="td" sx={{ width: '20%', color: 'text.secondary' }}>
                              {change.field}:
                            </Box>
                            {event.type === 'UPDATE' ? (
                              <>
                                <Box component="td" sx={{ width: '40%', color: 'error.main' }}>
                                  {change.oldValue || '-'}
                                </Box>
                                <Box component="td" sx={{ width: '40%', color: 'success.main' }}>
                                  {change.newValue || '-'}
                                </Box>
                              </>
                            ) : event.type === 'CREATE' ? (
                              <Box component="td" sx={{ width: '80%', color: 'success.main' }}>
                                {change.newValue}
                              </Box>
                            ) : (
                              <Box component="td" sx={{ width: '80%', color: 'error.main' }}>
                                {change.oldValue}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="E-mail"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <MaskedInput
              mask="phone"
              name="phone"
              label="Telefone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Endereço"
              fullWidth
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
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