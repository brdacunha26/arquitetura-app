'use client';

import React from 'react';
import { Container, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TeamList from '@/components/TeamList';

export default function TeamPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ position: 'relative', mb: 4 }}>
        <IconButton 
          onClick={handleBackClick} 
          sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ width: '100%' }}
        >
          Equipe
        </Typography>
      </Box>

      <TeamList />
    </Container>
  );
} 