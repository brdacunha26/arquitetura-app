'use client';

import { Box, Container } from '@mui/material';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '100vh' }}>{children}</Box>
    </Container>
  );
} 