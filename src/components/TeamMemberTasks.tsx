'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTeamContext } from '@/contexts/TeamContext';
import { useTaskContext } from '@/contexts/TaskContext';

const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  BLOCKED: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  BLOCKED: 'Bloqueada',
};

const priorityColors = {
  HIGH: '#f44336',
  MEDIUM: '#ff9800',
  LOW: '#4caf50',
};

const priorityLabels = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
};

export default function TeamMemberTasks() {
  const { members } = useTeamContext();
  const { tasks } = useTaskContext();
  const [selectedMember, setSelectedMember] = useState<string>('');

  const memberTasks = tasks.filter((task) => task.assignedTo === selectedMember);

  const taskStats = {
    total: memberTasks.length,
    pending: memberTasks.filter((task) => task.status === 'PENDING').length,
    inProgress: memberTasks.filter((task) => task.status === 'IN_PROGRESS').length,
    completed: memberTasks.filter((task) => task.status === 'COMPLETED').length,
    delayed: memberTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'COMPLETED';
    }).length,
    highPriority: memberTasks.filter((task) => task.priority === 'HIGH').length,
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resumo de Tarefas por Membro
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Selecione um Membro</InputLabel>
        <Select
          value={selectedMember}
          label="Selecione um Membro"
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          {members.map((member) => (
            <MenuItem key={member.id} value={member.name}>
              {member.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedMember && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total de Tarefas
                  </Typography>
                  <Typography variant="h4">{taskStats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pendentes
                  </Typography>
                  <Typography variant="h4" color={statusColors.PENDING}>
                    {taskStats.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Em Andamento
                  </Typography>
                  <Typography variant="h4" color={statusColors.IN_PROGRESS}>
                    {taskStats.inProgress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Concluídas
                  </Typography>
                  <Typography variant="h4" color={statusColors.COMPLETED}>
                    {taskStats.completed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Atrasadas
                  </Typography>
                  <Typography variant="h4" color={statusColors.BLOCKED}>
                    {taskStats.delayed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Alta Prioridade
                  </Typography>
                  <Typography variant="h4" color={priorityColors.HIGH}>
                    {taskStats.highPriority}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Data de Entrega</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[task.status]}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[task.status]}20`,
                          color: statusColors[task.status],
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={priorityLabels[task.priority]}
                        size="small"
                        sx={{
                          bgcolor: `${priorityColors[task.priority]}20`,
                          color: priorityColors[task.priority],
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
} 