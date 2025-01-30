import { Paper, Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  onClick?: () => void;
}

export default function DashboardCard({ title, value, icon, color, onClick }: DashboardCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `${color}20`,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </Paper>
  );
} 