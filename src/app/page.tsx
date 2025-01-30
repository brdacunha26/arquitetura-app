'use client';

import { Box, Container, Typography, Grid, Paper, Tooltip, IconButton, Tabs, Tab } from '@mui/material';
import DashboardCard from '@/components/DashboardCard';
import {
  Schedule as TaskIcon,
  AttachMoney as PaymentIcon,
  People as TeamIcon,
  Person as ClientIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { useClientContext } from '@/contexts/ClientContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { useTasks } from '@/contexts/TaskContext';
import Cookies from 'js-cookie';
import TeamList from '@/components/TeamList';
import ProjectList from '@/components/ProjectList';
import ClientList from '@/components/ClientList';
import ProtectedRoute from '@/components/ProtectedRoute';

type UserData = {
  name: string;
  role: string;
  email: string;
};

function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { projects } = useProjects();
  const { clients } = useClientContext();
  const { members } = useTeamContext();
  const { transactions } = useFinanceContext();
  const { tasks } = useTasks();

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userCookie) as UserData;
      setUser(parsedUser);
    } catch (error) {
      console.error('Erro ao parsear cookie de usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('user');
    router.push('/login');
  };

  const handleAdminSettings = () => {
    router.push('/admin');
  };

  // Calcular estatísticas com memoização
  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = tasks.filter(task => task.status === 'PENDING');
    const delayedTasks = tasks.filter(task => {
      const taskDeadline = new Date(task.deadline);
      taskDeadline.setHours(0, 0, 0, 0);
      return taskDeadline < today && task.status !== 'COMPLETED';
    });

    return {
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      pendingTasks: pendingTasks.length,
      overdueTasks: delayedTasks.length,
      monthlyIncome: transactions
        .filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0),
      activeTeamMembers: members.filter(m => m.status === 'ACTIVE').length,
      onVacationMembers: members.filter(m => m.status === 'ON_VACATION').length,
      totalClients: clients.length
    };
  }, [projects, tasks, transactions, members, clients]);

  const handleTasksCardClick = () => router.push('/tasks');
  const handleTeamCardClick = () => router.push('/team');
  const handleFinanceCardClick = () => router.push('/finance');
  const handleClientsCardClick = () => router.push('/clients');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Renderização condicional de carregamento
  if (isLoading) {
    return <Container>Carregando...</Container>;
  }

  // Verificação de usuário
  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Olá, {user.name}
        </Typography>
        <Box>
          {user.role === 'ADMIN' && (
            <Tooltip title="Configurações de Administrador">
              <IconButton 
                color="primary" 
                onClick={handleAdminSettings}
                sx={{ mr: 2 }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Sair">
            <IconButton color="error" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<TeamIcon />} label="Equipe" />
          <Tab icon={<WorkIcon />} label="Projetos" />
          <Tab icon={<ClientIcon />} label="Clientes" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <DashboardCard
                title="Tarefas"
                value={`${dashboardStats.pendingTasks} Tarefas Pendentes\n${dashboardStats.overdueTasks} Tarefas Atrasadas`}
                icon={<TaskIcon />}
                color="#ff9800"
                onClick={handleTasksCardClick}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <DashboardCard
                title="Clientes"
                value={dashboardStats.totalClients.toString()}
                icon={<ClientIcon />}
                color="#4caf50"
                onClick={handleClientsCardClick}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <DashboardCard
                title="Equipe"
                value={dashboardStats.activeTeamMembers.toString()}
                icon={<TeamIcon />}
                color="#2196f3"
                subtitle={`${dashboardStats.onVacationMembers} em férias`}
                onClick={handleTeamCardClick}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <DashboardCard
                title="Financeiro"
                value=""
                icon={<PaymentIcon />}
                color="#795548"
                onClick={handleFinanceCardClick}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Calendário Semanal
                  </Typography>
                </Box>
                <WeeklyCalendar />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && <TeamList />}

      {activeTab === 2 && <ProjectList />}

      {activeTab === 3 && <ClientList />}
    </Container>
  );
}

export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
} 