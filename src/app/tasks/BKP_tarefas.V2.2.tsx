'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import TaskList from '@/components/TaskList';
import { useState } from 'react';
import { useTasks, TaskStatus, statusLabels } from '@/contexts/TaskContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectContext';
import BackButton from '@/components/BackButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { tasks, updateTask, deleteTask } = useTasks();
  const { members } = useTeamContext();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | ''>('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'calendar' | 'project_step'>('all');
  const [tabValue, setTabValue] = useState(0);

  const handleEditTask = (task: any) => {
    // Implementar edição de tarefa
    console.log('Editar tarefa:', task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedProject && task.project !== selectedProject) return false;
    if (selectedMember && task.assignedTo !== selectedMember) return false;
    if (selectedStatus && task.status !== selectedStatus) return false;
    if (selectedSource !== 'all' && task.source !== selectedSource) return false;
    return true;
  });

  // Separar tarefas por status para a visualização em abas
  const pendingTasks = filteredTasks.filter(task => task.status === 'PENDING');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(task => task.status === 'COMPLETED');
  const delayedTasks = filteredTasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDeadline = new Date(task.deadline);
    taskDeadline.setHours(0, 0, 0, 0);
    return taskDeadline < today && task.status !== 'COMPLETED';
  });

  return (
    <Box sx={{ p: 3 }}>
      <BackButton />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1">
            Tarefas
          </Typography>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Projeto</InputLabel>
                <Select
                  value={selectedProject}
                  label="Filtrar por Projeto"
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <MenuItem value="">Todos os Projetos</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.title}>
                      {project.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Responsável</InputLabel>
                <Select
                  value={selectedMember}
                  label="Filtrar por Responsável"
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <MenuItem value="">Todos os Responsáveis</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.name}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Filtrar por Status"
                  onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | '')}
                >
                  <MenuItem value="">Todos os Status</MenuItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Origem</InputLabel>
                <Select
                  value={selectedSource}
                  label="Origem"
                  onChange={(e) => setSelectedSource(e.target.value as 'all' | 'calendar' | 'project_step')}
                >
                  <MenuItem value="all">Todas as Origens</MenuItem>
                  <MenuItem value="calendar">Calendário</MenuItem>
                  <MenuItem value="project_step">Etapas de Projeto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`Pendentes (${pendingTasks.length})`} />
              <Tab label={`Em Andamento (${inProgressTasks.length})`} />
              <Tab label={`Concluídas (${completedTasks.length})`} />
              <Tab label={`Atrasadas (${delayedTasks.length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TaskList
              tasks={pendingTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TaskList
              tasks={inProgressTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TaskList
              tasks={completedTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <TaskList
              tasks={delayedTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
} 