'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useClientContext, Client } from '@/contexts/ClientContext';
import InputMask from 'react-input-mask';

const initialFormData: Omit<Client, 'id'> = {
  name: '',
  birthDate: '',
  cpf: '',
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  }
};

export default function ClientList() {
  const { clients, addClient, updateClient, deleteClient } = useClientContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      const { id, ...clientData } = client;
      setFormData(clientData);
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
    const updateNestedField = (obj: any, path: string[], value: string) => {
      const [head, ...rest] = path;
      return {
        ...obj,
        [head]: rest.length ? updateNestedField(obj[head] || {}, rest, value) : value
      };
    };

    const pathParts = field.split('.');
    setFormData(prev => updateNestedField(prev, pathParts, value));
  };

  const handleSave = () => {
    if (editingId) {
      updateClient({ ...formData, id: editingId });
    } else {
      addClient(formData);
    }
    handleCloseDialog();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cliente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>{client.address.city}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(client)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => deleteClient(client.id)} 
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InputMask
                mask="999.999.999-99"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
              >
                {() => (
                  <TextField
                    fullWidth
                    label="CPF"
                    required
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InputMask
                mask="99999-999"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
              >
                {() => (
                  <TextField
                    fullWidth
                    label="CEP"
                    required
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Rua"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                value={formData.address.number}
                onChange={(e) => handleInputChange('address.number', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.address.neighborhood}
                onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                required
              />
            </Grid>
          </Grid>
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