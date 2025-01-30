'use client';

import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import DashboardCard from '@/components/DashboardCard';
import {
  Assignment as ProjectIcon,
  Schedule as TaskIcon,
  AttachMoney as PaymentIcon,
  People as TeamIcon,
  Person as ClientIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();

  const [tasks, setTasks] = useState([
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
  ]);

  const handleTeamCardClick = () => {
    router.push('/team');
  };

  const handleProjectsCardClick = () => {
    router.push('/projects');
  };

  const handleClientsCardClick = () => {
    router.push('/clients');
  };

  const handleTasksCardClick = () => {
    router.push('/tasks');
  };

  const handleFinanceCardClick = () => {
    router.push('/finance');
  };

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

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...newTask,
        id: Math.random().toString(36).substr(2, 9),
        dueDate: newTask.dueDate || new Date(),
      },
    ]);
  };

  const handleUpdateTask = (taskId, updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updatedTask, dueDate: updatedTask.dueDate || task.dueDate }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard
            title="Clientes"
            value="24"
            icon={<ClientIcon />}
            color="#9c27b0"
            subtitle="3 novos este mês"
            onClick={handleClientsCardClick}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard
            title="Projetos"
            value="5"
            icon={<ProjectIcon />}
            color="#4caf50"
            subtitle="2 em andamento"
            onClick={handleProjectsCardClick}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard
            title="Tarefas"
            value="28"
            icon={<TaskIcon />}
            color="#ff9800"
            subtitle="12 pendentes"
            onClick={handleTasksCardClick}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard
            title="Equipe"
            value="8"
            icon={<TeamIcon />}
            color="#2196f3"
            subtitle="2 em férias"
            onClick={handleTeamCardClick}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard
            title="Financeiro"
            value="R$ 45.280"
            icon={<PaymentIcon />}
            color="#795548"
            subtitle="Receita mensal"
            onClick={handleFinanceCardClick}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Calendário Semanal
          </Typography>
          <WeeklyCalendar
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            teamMembers={teamMembers}
            projects={projects}
          />
        </Paper>
      </Grid>
    </Container>
  );
} 