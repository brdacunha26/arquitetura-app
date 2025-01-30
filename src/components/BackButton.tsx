'use client';

import { IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <IconButton 
      onClick={() => router.push('/')}
      sx={{ 
        position: 'fixed',
        left: 24,
        top: 24,
        bgcolor: 'background.paper',
        boxShadow: 1,
        zIndex: 1000,
        '&:hover': { bgcolor: 'background.paper' }
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
} 