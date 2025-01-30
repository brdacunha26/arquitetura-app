'use client';

import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import DashboardCard from '@/components/DashboardCard';
import ProjectList from '@/components/ProjectList';
import {
  Assignment as ProjectIcon,
  Schedule as TaskIcon,
  AttachMoney as PaymentIcon,
  People as TeamIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Dados de exemplo - depois serão substituídos por dados do banco
const mockProjects = [
  {
    id: '1',
    title: 'Residência Moderna Vila Nova',
    clientName: 'João Silva',
    status: 'IN_PROGRESS',
    endDate: new Date(2024, 2, 15),
  },
  {
    id: '2',
    title: 'Reforma Apartamento Jardins',
    clientName: 'Maria Santos',
    status: 'PLANNING',
    endDate: new Date(2024, 1, 30),
  },
  {
    id: '3',
    title: 'Projeto Comercial Centro',
    clientName: 'Empresa XYZ',
    status: 'REVIEW',
    endDate: new Date(2024, 1, 20),
  },
] as const;

// Dados de exemplo para próximas entregas
const mockDeliveries = [
  {
    id: '1',
    title: 'Plantas Baixas - Residência Vila Nova',
    project: 'Residência Moderna Vila Nova',
    responsible: 'Ana Silva',
    dueDate: new Date(2024, 1, 15),
    status: 'PENDING',
  },
  {
    id: '2',
    title: 'Projeto Elétrico - Apartamento Jardins',
    project: 'Reforma Apartamento Jardins',
    responsible: 'Carlos Santos',
    dueDate: new Date(2024, 1, 20),
    status: 'IN_PROGRESS',
  },
  {
    id: '3',
    title: 'Renderização 3D - Projeto Comercial',
    project: 'Projeto Comercial Centro',
    responsible: 'Mariana Costa',
    dueDate: new Date(2024, 1, 25),
    status: 'REVIEW',
  },
];

const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  REVIEW: '#9c27b0',
  COMPLETED: '#4caf50',
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  REVIEW: 'Em Revisão',
  COMPLETED: 'Concluído',
};

export default function Home() {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleProjectsCardClick = () => {
    router.push('/projects');
  };

  const handleTasksCardClick = () => {
    router.push('/tasks');
  };

  const handleTeamCardClick = () => {
    router.push('/team');
  };

  const handleFinanceCardClick = () => {
    router.push('/finance');
  };

  const handleDeliveryClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Projetos Ativos"
            value="12"
            icon={<ProjectIcon />}
            color="#2196f3"
            onClick={handleProjectsCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Tarefas Pendentes"
            value="28"
            icon={<TaskIcon />}
            color="#ff9800"
            onClick={handleTasksCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Financeiro"
            value=""
            icon={<PaymentIcon />}
            color="#4caf50"
            onClick={handleFinanceCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Equipe"
            value="8"
            icon={<TeamIcon />}
            color="#f44336"
            onClick={handleTeamCardClick}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Projetos Recentes
            </Typography>
            <ProjectList
              projects={mockProjects}
              onProjectClick={handleProjectClick}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Próximas Entregas
            </Typography>
            <List>
              {mockDeliveries.map((delivery) => (
                <ListItem
                  key={delivery.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  onClick={() => handleDeliveryClick(delivery.id)}
                >
                  <ListItemText
                    primary={delivery.title}
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {delivery.project} • {delivery.responsible}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Entrega: {delivery.dueDate.toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={statusLabels[delivery.status as keyof typeof statusLabels]}
                            size="small"
                            sx={{
                              backgroundColor: `${statusColors[delivery.status as keyof typeof statusColors]}20`,
                              color: statusColors[delivery.status as keyof typeof statusColors],
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 