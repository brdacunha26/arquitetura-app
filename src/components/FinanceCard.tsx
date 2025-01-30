'use client';

import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function FinanceCard() {
  const router = useRouter();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6
        }
      }}
      onClick={() => router.push('/finance')}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton size="large" sx={{ bgcolor: 'primary.main', color: 'white', mr: 2 }}>
            <MonetizationOnIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            Financeiro
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Gerencie receitas, despesas e acompanhe o fluxo de caixa dos projetos
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 