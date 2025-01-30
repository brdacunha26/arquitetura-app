import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
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
  onClick 
}: DashboardCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 3 } : {},
      }} 
      onClick={onClick}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { color, opacity: 0.7 } 
          })}
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '1rem',  // Reduzir tamanho da fonte
            whiteSpace: 'pre-line',  // Permitir quebra de linha
            lineHeight: 1.2,  // Reduzir espaçamento entre linhas
            mt: 1 
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 