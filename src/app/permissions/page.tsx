'use client';

import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  Chip
} from '@mui/material';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PermissionsPage() {
  const { checkPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário tem permissão de visualizar
    if (!checkPermission('users', 'view')) {
      router.push('/');
    }
  }, []);

  const renderPermissionStatus = (hasPermission: boolean) => (
    <Chip 
      label={hasPermission ? 'Permitido' : 'Negado'} 
      color={hasPermission ? 'success' : 'error'} 
      size="small" 
    />
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Permissões de Usuário
      </Typography>

      {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
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
                    <TableCell>
                      {renderPermissionStatus(permissions[section].view)}
                    </TableCell>
                    <TableCell>
                      {renderPermissionStatus(permissions[section].create)}
                    </TableCell>
                    <TableCell>
                      {renderPermissionStatus(permissions[section].edit)}
                    </TableCell>
                    <TableCell>
                      {renderPermissionStatus(permissions[section].delete)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Container>
  );
} 