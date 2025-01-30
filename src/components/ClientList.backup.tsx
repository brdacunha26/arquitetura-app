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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MaskedInput } from '@/components/MaskedInput';
import { format } from 'date-fns';

interface ClientFormData {
  id?: string;
  name: string;
  birthDate: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const initialFormData: ClientFormData = {
  name: '',
  birthDate: '',
  cpf: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
};

// Dados de exemplo - depois serão substituídos por dados do banco
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    birthDate: '1985-06-15',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  },
  {
    id: '2',
    name: 'Maria Santos',
    birthDate: '1990-03-22',
    cpf: '987.654.321-00',
    address: {
      street: 'Avenida Principal',
      number: '456',
      complement: 'Apto 101',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
    },
  },
];

export default function ClientList() {
  const [clients, setClients] = useState(mockClients);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenDialog = (client?: ClientFormData) => {
    if (client) {
      setFormData(client);
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

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    if (editingId) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === editingId ? { ...formData, id: editingId } : client
        )
      );
    } else {
      const newClient = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setClients((prev) => [...prev, newClient]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cliente
        </Button>
      </Box>

      <Grid container spacing={3}>
        {clients.map((client) => (
          <Grid item xs={12} key={client.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{client.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    CPF: {client.cpf}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nascimento: {format(new Date(client.birthDate), 'dd/MM/yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {client.address.street}, {client.address.number}
                    {client.address.complement && ` - ${client.address.complement}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client.address.neighborhood} - {client.address.city}/{client.address.state}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CEP: {client.address.zipCode}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(client)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  InputProps={{
                    inputComponent: MaskedInput as any,
                    inputProps: {
                      mask: '000.000.000-00',
                      name: 'cpf',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Endereço
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  label="Rua"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Número"
                  value={formData.address.number}
                  onChange={(e) => handleInputChange('address.number', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={formData.address.complement}
                  onChange={(e) => handleInputChange('address.complement', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  InputProps={{
                    inputComponent: MaskedInput as any,
                    inputProps: {
                      mask: '00000-000',
                      name: 'zipCode',
                    },
                  }}
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