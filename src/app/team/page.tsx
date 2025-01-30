'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import TeamList from '@/components/TeamList';
import BackButton from '@/components/BackButton';

export default function TeamPage() {
  return (
    <Box sx={{ p: 3 }}>
      <BackButton />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            align="center"
          >
            Equipe
          </Typography>
        </Box>

        <TeamList />
      </Container>
    </Box>
  );
} 