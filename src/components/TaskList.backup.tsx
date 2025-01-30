'use client';

import { List, Box, Typography, Chip, Tabs, Tab } from '@mui/material';
import { Task } from '@/contexts/TaskContext';
import { useMemo, useState } from 'react';
import TimelineTab from './TimelineTab';
import { useTaskContext } from '@/contexts/TaskContext';

const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  DELAYED: '#f44336',
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  DELAYED: 'Atrasada',
};

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

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
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [tabValue, setTabValue] = useState(0);
  const { timelineEvents } = useTaskContext();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Tarefas" />
          <Tab label="Linha do Tempo" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <List>
          {sortedTasks.map((task) => (
            <Box
              key={task.id}
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {task.project} • Responsável: {task.assignedTo}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Chip
                    label={statusLabels[task.status]}
                    size="small"
                    sx={{
                      backgroundColor: `${statusColors[task.status]}20`,
                      color: statusColors[task.status],
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TimelineTab events={timelineEvents} />
      </TabPanel>
    </Box>
  );
} 