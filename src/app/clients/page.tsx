'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ClientList from '@/components/ClientList';
import BackButton from '@/components/BackButton';

export default function ClientsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <BackButton />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            align="center"
          >
            Clientes
          </Typography>
        </Box>

        <ClientList />
      </Container>
    </Box>
  );
} 