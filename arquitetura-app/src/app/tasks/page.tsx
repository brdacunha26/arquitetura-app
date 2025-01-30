'use client';

import { Container, Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import TaskList from '@/components/TaskList';
import { useState } from 'react';

// Dados de exemplo - serão substituídos por dados do banco
const mockProjects = [
  { id: '1', title: 'Residência Moderna Vila Nova' },
  { id: '2', title: 'Reforma Apartamento Jardins' },
  { id: '3', title: 'Projeto Comercial Centro' },
];

const mockTeam = [
  { id: '1', name: 'Ana Silva' },
  { id: '2', name: 'Carlos Santos' },
  { id: '3', name: 'Mariana Costa' },
];

const mockTasks = [
  {
    id: '1',
    title: 'Desenvolvimento do conceito',
    description: 'Criar o conceito inicial do projeto baseado no briefing do cliente',
    status: 'COMPLETED',
    priority: 'HIGH',
    assignedTo: 'Ana Silva',
    projectId: '1',
    dueDate: new Date(2024, 0, 15),
  },
  {
    id: '2',
    title: 'Plantas baixas',
    description: 'Desenvolver as plantas baixas detalhadas de todos os ambientes',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: 'Ana Silva',
    projectId: '1',
    dueDate: new Date(2024, 1, 1),
  },
  {
    id: '3',
    title: 'Projeto elétrico',
    description: 'Desenvolver o projeto elétrico completo',
    status: 'PENDING',
    priority: 'MEDIUM',
    assignedTo: 'Carlos Santos',
    projectId: '2',
    dueDate: new Date(2024, 1, 15),
  },
];

export default function TasksPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');

  const handleEditTask = (taskId: string) => {
    // Implementar edição de tarefa
    console.log('Editar tarefa:', taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    // Implementar exclusão de tarefa
    console.log('Excluir tarefa:', taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // Implementar mudança de status
    console.log('Mudar status:', taskId, newStatus);
  };

  const filteredTasks = mockTasks.filter(task => {
    if (selectedProject && task.projectId !== selectedProject) return false;
    if (selectedMember && task.assignedTo !== selectedMember) return false;
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tarefas
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Projeto</InputLabel>
                <Select
                  value={selectedProject}
                  label="Filtrar por Projeto"
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <MenuItem value="">Todos os Projetos</MenuItem>
                  {mockProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Responsável</InputLabel>
                <Select
                  value={selectedMember}
                  label="Filtrar por Responsável"
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <MenuItem value="">Todos os Responsáveis</MenuItem>
                  {mockTeam.map((member) => (
                    <MenuItem key={member.id} value={member.name}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TaskList
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 