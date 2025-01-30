'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useProjects } from './ProjectContext';
import { useProjectSteps } from './ProjectStepsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTeamContext } from './TeamContext';
import Cookies from 'js-cookie';
import { useTimeline } from './TimelineContext';

export const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  DELAYED: 'Atrasada',
  CANCELLED: 'Cancelada'
} as const;

export const statusColors = {
  PENDING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  DELAYED: '#f44336',
  CANCELLED: '#9e9e9e'
} as const;

export type TaskStatus = keyof typeof statusLabels;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  assignedTo: string;
  project: string;
  projectId: string;
  source: 'calendar' | 'project_step';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  completedAt?: string | null;
}

export const priorityLabels = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
} as const;

export const priorityColors = {
  HIGH: '#f44336',
  MEDIUM: '#ff9800',
  LOW: '#4caf50'
} as const;

interface TimelineEvent {
  id: string;
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'STATUS_CHANGE';
  taskId: string;
  description: string;
  date: string;
  user: string;
  details?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  timelineEvents: TimelineEvent[];
  setTimelineEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'date'>) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Briefing Inicial - Residencial Vila Nova',
    description: 'Reunião com cliente para levantamento de requisitos',
    status: 'COMPLETED',
    deadline: '2024-03-15',
    assignedTo: 'Ana Silva',
    project: 'Residencial Vila Nova',
    projectId: '1',
    source: 'calendar' as const,
    completedAt: '2024-03-15'
  },
  {
    id: '2',
    title: 'Medição do Espaço - Comercial Centro',
    description: 'Levantamento das medidas do local',
    status: 'IN_PROGRESS',
    deadline: '2024-03-20',
    assignedTo: 'Carlos Santos',
    project: 'Comercial Centro',
    projectId: '2',
    source: 'calendar' as const
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { projects } = useProjects();
  const { steps } = useProjectSteps();
  const { members } = useTeamContext();
  const { addEvent } = useTimeline();
  console.log('Cookies do usuário:', Cookies.get('user'));
  const user = JSON.parse(Cookies.get('user') || '{}');
  console.log('Usuário parseado:', user);

  // Sincronizar tarefas com as etapas dos projetos
  useEffect(() => {
    if (!projects || !steps) return;

    const projectStepTasks = steps.map(step => ({
      id: `step-${step.id}`,
      title: step.title,
      description: step.description,
      status: step.status as TaskStatus,
      deadline: step.deadline,
      assignedTo: step.assignedTo || 'Não atribuído',
      project: projects.find(p => p.id === step.projectId)?.title || '',
      projectId: step.projectId,
      source: 'project_step' as const,
      completedAt: step.completedAt
    }));

    // Manter apenas as tarefas do calendário e adicionar as novas tarefas das etapas
    const calendarTasks = tasks.filter(task => task.source === 'calendar');
    setTasks([...calendarTasks, ...projectStepTasks]);
  }, [projects, steps]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      source: 'calendar' as const
    };
    setTasks(prev => [...prev, newTask]);

    addEvent({
      type: 'TASK_CREATED',
      description: `Nova tarefa "${newTask.title}" criada`,
      user: user.name || 'Usuário',
      changes: [
        { field: 'Título', oldValue: '', newValue: newTask.title },
        { field: 'Prazo', oldValue: '', newValue: format(new Date(newTask.deadline), 'dd/MM/yyyy', { locale: ptBR }) },
        { field: 'Responsável', oldValue: '', newValue: newTask.assignedTo },
        { field: 'Status', oldValue: '', newValue: statusLabels[newTask.status] },
        { field: 'Prioridade', oldValue: '', newValue: priorityLabels[newTask.priority || 'MEDIUM'] }
      ]
    });
  };

  const updateTask = (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    if (!oldTask) return;

    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

    if (oldTask.title !== updatedTask.title) {
      changes.push({
        field: 'Título',
        oldValue: oldTask.title,
        newValue: updatedTask.title
      });
    }

    if (oldTask.description !== updatedTask.description) {
      changes.push({
        field: 'Descrição',
        oldValue: oldTask.description,
        newValue: updatedTask.description
      });
    }

    if (oldTask.status !== updatedTask.status) {
      changes.push({
        field: 'Status',
        oldValue: statusLabels[oldTask.status],
        newValue: statusLabels[updatedTask.status]
      });
    }

    if (oldTask.assignedTo !== updatedTask.assignedTo) {
      changes.push({
        field: 'Responsável',
        oldValue: oldTask.assignedTo,
        newValue: updatedTask.assignedTo
      });
    }

    if (oldTask.priority !== updatedTask.priority) {
      changes.push({
        field: 'Prioridade',
        oldValue: priorityLabels[oldTask.priority || 'MEDIUM'],
        newValue: priorityLabels[updatedTask.priority || 'MEDIUM']
      });
    }

    if (oldTask.deadline !== updatedTask.deadline) {
      changes.push({
        field: 'Prazo',
        oldValue: format(new Date(oldTask.deadline), 'dd/MM/yyyy', { locale: ptBR }),
        newValue: format(new Date(updatedTask.deadline), 'dd/MM/yyyy', { locale: ptBR })
      });
    }

    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));

    if (changes.length > 0) {
      addEvent({
        type: 'TASK_UPDATED',
        description: `Tarefa "${updatedTask.title}" atualizada`,
        user: user.name || 'Usuário',
        changes
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      addEvent({
        type: 'TASK_DELETED',
        description: `Tarefa "${task.title}" excluída`,
        user: user.name || 'Usuário',
        changes: [
          { field: 'Título', oldValue: task.title, newValue: '' },
          { field: 'Prazo', oldValue: format(new Date(task.deadline), 'dd/MM/yyyy', { locale: ptBR }), newValue: '' },
          { field: 'Responsável', oldValue: task.assignedTo, newValue: '' },
          { field: 'Status', oldValue: statusLabels[task.status], newValue: '' }
        ]
      });
    }
  };

  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTasksByAssignee = (assigneeId: string) => {
    return tasks.filter(task => task.assignedTo === assigneeId);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      addTask,
      updateTask,
      deleteTask,
      getTasksByProject,
      getTasksByAssignee,
      getTasksByStatus,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
} 