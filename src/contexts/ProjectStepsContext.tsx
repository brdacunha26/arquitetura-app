'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProjects } from './ProjectContext';

export interface ProjectStep {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string;
  completedAt: string | null;
  projectId: string;
  assignedTo: string | null;
}

interface ProjectStepsContextType {
  steps: ProjectStep[];
  addStep: (step: Omit<ProjectStep, 'id'>) => void;
  updateStep: (step: ProjectStep) => void;
  deleteStep: (stepId: number) => void;
  getStepsByProject: (projectId: string) => ProjectStep[];
}

const ProjectStepsContext = createContext<ProjectStepsContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialSteps: ProjectStep[] = [
  {
    id: 1,
    title: 'Briefing Inicial',
    description: 'Reunião com o cliente para entender necessidades, preferências e expectativas do projeto',
    status: 'COMPLETED',
    deadline: '2024-03-15',
    completedAt: '2024-03-14',
    projectId: '1',
    assignedTo: 'Ana Silva'
  },
  {
    id: 2,
    title: 'Medição do Espaço',
    description: 'Levantamento das medidas e condições do local do projeto',
    status: 'IN_PROGRESS',
    deadline: '2024-03-20',
    completedAt: null,
    projectId: '1',
    assignedTo: 'Carlos Santos'
  },
  // ... outros passos iniciais
];

export function ProjectStepsProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<ProjectStep[]>(initialSteps);
  const { projects } = useProjects();

  // Sincronizar passos com projetos existentes
  useEffect(() => {
    if (!projects) return;

    const validSteps = steps.filter(step => 
      projects.some(project => project.id === step.projectId)
    );

    if (validSteps.length !== steps.length) {
      setSteps(validSteps);
    }
  }, [projects]);

  const addStep = (newStep: Omit<ProjectStep, 'id'>) => {
    setSteps(prevSteps => [
      ...prevSteps,
      { ...newStep, id: Math.max(...prevSteps.map(s => s.id), 0) + 1 }
    ]);
  };

  const updateStep = (updatedStep: ProjectStep) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === updatedStep.id ? updatedStep : step
      )
    );
  };

  const deleteStep = (stepId: number) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== stepId));
  };

  const getStepsByProject = (projectId: string) => {
    return steps.filter(step => step.projectId === projectId);
  };

  return (
    <ProjectStepsContext.Provider value={{ 
      steps, 
      addStep, 
      updateStep, 
      deleteStep,
      getStepsByProject
    }}>
      {children}
    </ProjectStepsContext.Provider>
  );
}

export function useProjectSteps() {
  const context = useContext(ProjectStepsContext);
  if (context === undefined) {
    throw new Error('useProjectSteps must be used within a ProjectStepsProvider');
  }
  return context;
} 