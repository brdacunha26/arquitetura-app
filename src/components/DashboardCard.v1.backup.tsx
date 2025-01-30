/**
 * DashboardCard.v1.backup.tsx
 * Versão 1.0 do Card de Dashboard
 * 
 * Funcionalidades:
 * - Exibição de métricas com ícones
 * - Sistema de cores personalizável
 * - Animação hover
 * - Título, valor e subtítulo configuráveis
 * - Clicável para navegação
 * 
 * Data: 2024
 */

import { ReactNode } from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  subtitle,
  onClick,
}: DashboardCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
      elevation={1}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box component="span" sx={{ color, '& > svg': { fontSize: 24 } }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
} 