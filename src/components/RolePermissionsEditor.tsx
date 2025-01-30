'use client';

import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Switch, 
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useState, useEffect } from 'react';
import { 
  ROLE_PERMISSIONS, 
  Role, 
  RolePermissions 
} from '@/config/roles';

export default function RolePermissionsEditor() {
  const [permissions, setPermissions] = useState<Record<Role, RolePermissions>>(
    JSON.parse(JSON.stringify(ROLE_PERMISSIONS))
  );
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const togglePermission = (
    role: Role, 
    section: keyof RolePermissions, 
    action: keyof RolePermissions['projects']
  ) => {
    const newPermissions = { ...permissions };
    newPermissions[role][section][action] = 
      !newPermissions[role][section][action];
    
    // Lógica para garantir consistência
    if (action === 'view') {
      if (!newPermissions[role][section][action]) {
        // Se desabilitar visualização, desabilita outras ações
        ['create', 'edit', 'delete'].forEach(a => {
          newPermissions[role][section][a as keyof RolePermissions['projects']] = false;
        });
      }
    } else {
      // Se habilitar criar/editar/excluir, habilita visualização
      if (newPermissions[role][section][action]) {
        newPermissions[role][section].view = true;
      }
    }

    setPermissions(newPermissions);
  };

  const handleSavePermissionsConfirm = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    setIsConfirmDialogOpen(false);
    
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar permissões');
      }

      setSaveStatus({
        success: true,
        message: data.message || 'Permissões salvas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setSaveStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao salvar permissões'
      });
    }
  };

  // Carregar permissões salvas ao montar o componente
  useEffect(() => {
    const fetchSavedPermissions = async () => {
      try {
        const response = await fetch('/api/roles');
        const data = await response.json();

        if (response.ok && Object.keys(data).length > 0) {
          setPermissions(data);
        }
      } catch (error) {
        console.error('Erro ao buscar permissões salvas:', error);
      }
    };

    fetchSavedPermissions();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuração de Permissões
      </Typography>

      {saveStatus && (
        <Alert 
          severity={saveStatus.success ? 'success' : 'error'}
          onClose={() => setSaveStatus(null)}
          sx={{ mb: 2 }}
        >
          {saveStatus.message}
        </Alert>
      )}

      {(Object.keys(permissions) as Role[]).map((role) => (
        <Paper key={role} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Função: {role}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Seção</TableCell>
                  <TableCell>Visualizar</TableCell>
                  <TableCell>Criar</TableCell>
                  <TableCell>Editar</TableCell>
                  <TableCell>Excluir</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(['projects', 'tasks', 'users', 'finance'] as const).map((section) => (
                  <TableRow key={section}>
                    <TableCell>{section.charAt(0).toUpperCase() + section.slice(1)}</TableCell>
                    {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                      <TableCell key={action}>
                        <Switch
                          checked={permissions[role][section][action]}
                          onChange={() => togglePermission(role, section, action)}
                          color="primary"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSavePermissionsConfirm}
        >
          Salvar Permissões
        </Button>
      </Box>

      {/* Diálogo de confirmação */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Alterações de Permissões</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja salvar estas alterações de permissões? 
            Isso afetará o acesso de todos os usuários com estas funções.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSavePermissions} color="error" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 