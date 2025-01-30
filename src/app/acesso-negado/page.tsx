'use client';

import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';

export default function AcessoNegadoPage() {
  const router = useRouter();

  return (
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        textAlign: 'center',
        padding: 3
      }}
    >
      <LockIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Acesso Negado
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => router.push('/')}
      >
        Voltar para Página Inicial
      </Button>
    </Box>
  );
} 