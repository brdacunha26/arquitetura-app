'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamMember } from './TeamContext';
import { useProjects } from './ProjectContext';
import { useTeamContext } from './TeamContext';

export interface ProjectStage {
  id: string;
  title: string;
  description: string;
  endDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  responsibleMember?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProjectFinanceTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface ProjectTimelineEvent {
  id: string;
  type: string;
  description: string;
  date: string;
  user: string;
  oldValue?: string;
  newValue?: string;
}

export interface ProjectDetailsContextType {
  projectId: string;
  projectStages: ProjectStage[];
  addProjectStage: (stage: Omit<ProjectStage, 'id'>) => void;
  updateProjectStage: (stage: ProjectStage) => void;
  deleteProjectStage: (stageId: string) => void;
  
  projectFinances: ProjectFinanceTransaction[];
  addFinanceTransaction: (transaction: Omit<ProjectFinanceTransaction, 'id'>) => void;
  updateFinanceTransaction: (transaction: ProjectFinanceTransaction) => void;
  deleteFinanceTransaction: (transactionId: string) => void;
}

const ProjectDetailsContext = createContext<ProjectDetailsContextType | undefined>(undefined);

export function ProjectDetailsProvider({ children, projectId }: { children: React.ReactNode, projectId: string }) {
  const { projects, updateProject } = useProjects();
  const { members } = useTeamContext();
  
  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    console.log('ProjectDetailsProvider - Estado atual:', {
      projectId,
      currentProject,
      projects
    });
  }, [projectId, currentProject, projects]);

  // Remover logs e lógica de equipe
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([
    {
      id: '1',
      title: 'Planejamento Inicial',
      description: 'Definição de escopo e requisitos',
      status: 'PENDING'
    }
  ]);

  const [projectFinances, setProjectFinances] = useState<ProjectFinanceTransaction[]>([]);

  const addProjectStage = (stage: Omit<ProjectStage, 'id'>) => {
    const newStage = { ...stage, id: crypto.randomUUID() };
    setProjectStages(prev => [...prev, newStage]);
  };

  const updateProjectStage = (updatedStage: ProjectStage) => {
    setProjectStages(prev => 
      prev.map(stage => stage.id === updatedStage.id ? updatedStage : stage)
    );
  };

  const deleteProjectStage = (stageId: string) => {
    setProjectStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const addFinanceTransaction = (transaction: Omit<ProjectFinanceTransaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setProjectFinances(prev => [...prev, newTransaction]);
  };

  const updateFinanceTransaction = (updatedTransaction: ProjectFinanceTransaction) => {
    setProjectFinances(prev => 
      prev.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const deleteFinanceTransaction = (transactionId: string) => {
    setProjectFinances(prev => prev.filter(transaction => transaction.id !== transactionId));
  };

  return (
    <ProjectDetailsContext.Provider value={{
      projectId,
      projectStages,
      addProjectStage,
      updateProjectStage,
      deleteProjectStage,
      
      projectFinances,
      addFinanceTransaction,
      updateFinanceTransaction,
      deleteFinanceTransaction,
    }}>
      {children}
    </ProjectDetailsContext.Provider>
  );
}

export function useProjectDetails() {
  const context = useContext(ProjectDetailsContext);
  if (context === undefined) {
    throw new Error('useProjectDetails must be used within a ProjectDetailsProvider');
  }

  return context;
} 