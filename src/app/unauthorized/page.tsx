'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Container 
} from '@mui/material';
import { useRouter } from 'next/navigation';
import LockIcon from '@mui/icons-material/Lock';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Container maxWidth="xs">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          textAlign: 'center'
        }}
      >
        <LockIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" color="error" gutterBottom>
          Acesso Não Autorizado
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Você não possui permissão para acessar esta página.
          Entre em contato com o administrador do sistema.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => router.push('/')}
        >
          Voltar para Início
        </Button>
      </Box>
    </Container>
  );
} 