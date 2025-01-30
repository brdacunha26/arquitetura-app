/**
 * dashboard.v1.backup.tsx
 * Versão 1.0 do Dashboard
 * 
 * Funcionalidades:
 * - Cards informativos com métricas principais
 * - Integração com calendário semanal
 * - Gerenciamento de equipe e projetos
 * - Sistema de cores para identificação visual
 * - Navegação entre diferentes seções
 * 
 * Data: 2024
 */

'use client';

import { useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import {
  Person as ClientIcon,
  Group as TeamIcon,
  Assignment as ProjectIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/DashboardCard';
import WeeklyCalendar from '@/components/WeeklyCalendar';

// Dados iniciais para demonstração
const initialTasks = [
  {
    id: '1',
    title: 'Reunião de Planejamento',
    assignedTo: 'user1',
    project: 'project1',
    status: 'PENDING',
    date: new Date(),
  },
  {
    id: '2',
    title: 'Desenvolvimento Frontend',
    assignedTo: 'user2',
    project: 'project2',
    status: 'IN_PROGRESS',
    date: new Date(),
  },
];

const teamMembers = [
  { id: 'user1', name: 'João Silva' },
  { id: 'user2', name: 'Maria Santos' },
  { id: 'user3', name: 'Pedro Oliveira' },
];

const projects = [
  { id: 'project1', title: 'Sistema de Gestão' },
  { id: 'project2', title: 'App Mobile' },
  { id: 'project3', title: 'Website Institucional' },
];

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);

  // Handlers para navegação
  const handleTeamCardClick = () => {
    router.push('/team');
  };

  const handleProjectsCardClick = () => {
    router.push('/projects');
  };

  const handleClientsCardClick = () => {
    router.push('/clients');
  };

  const handleCalendarCardClick = () => {
    // Implementar navegação para calendário completo se necessário
  };

  // Handlers para gerenciamento de tarefas
  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...newTask,
        id: Math.random().toString(36).substr(2, 9),
      },
    ]);
  };

  const handleUpdateTask = (taskId, updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updatedTask }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Equipe"
            value="12"
            icon={<TeamIcon />}
            color={theme.palette.primary.main}
            subtitle="2 novos este mês"
            onClick={handleTeamCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Projetos"
            value="8"
            icon={<ProjectIcon />}
            color={theme.palette.success.main}
            subtitle="3 em andamento"
            onClick={handleProjectsCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Clientes"
            value="24"
            icon={<ClientIcon />}
            color="#9c27b0"
            subtitle="3 novos este mês"
            onClick={handleClientsCardClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Calendário"
            value="15"
            icon={<CalendarIcon />}
            color={theme.palette.warning.main}
            subtitle="Tarefas esta semana"
            onClick={handleCalendarCardClick}
          />
        </Grid>
      </Grid>

      <WeeklyCalendar
        tasks={tasks}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        teamMembers={teamMembers}
        projects={projects}
      />
    </Box>
  );
} 