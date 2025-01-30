'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import RolePermissionsEditor from '@/components/RolePermissionsEditor';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const router = useRouter();

  // Verificar permissão de admin
  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userCookie);
    if (user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      const fetchedUsers = await response.json();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleOpenDialog = (user?: User) => {
    setCurrentUser(user || {
      name: '',
      email: '',
      password: '',
      role: 'USER'
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const url = currentUser.id ? '/api/users' : '/api/users';
      const method = currentUser.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(currentUser.id && { id: currentUser.id }),
          name: currentUser.name,
          email: currentUser.email,
          ...(currentUser.password && { password: currentUser.password }),
          role: currentUser.role || 'USER'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar usuário');
      }

      fetchUsers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }

      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/')}
          sx={{ mr: 2 }}
        >
          Voltar para Início
        </Button>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexGrow: 1 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<PersonIcon />} label="Usuários" />
            <Tab icon={<SecurityIcon />} label="Permissões" />
          </Tabs>
        </Box>
      </Box>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">Gerenciamento de Usuários</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
            >
              Novo Usuário
            </Button>
          </Box>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Função</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleOpenDialog(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {activeTab === 1 && (
        <RolePermissionsEditor />
      )}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentUser.id ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              value={currentUser.name || ''}
              onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={currentUser.email || ''}
              onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Senha"
              type="password"
              value={currentUser.password || ''}
              onChange={(e) => setCurrentUser(prev => ({ ...prev, password: e.target.value }))}
              fullWidth
              helperText={currentUser.id ? 'Deixe em branco para manter a senha atual' : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={currentUser.role || 'USER'}
                onChange={(e) => setCurrentUser(prev => ({ ...prev, role: e.target.value }))}
                label="Função"
              >
                <MenuItem value="USER">Usuário</MenuItem>
                <MenuItem value="MANAGER">Gerente</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 