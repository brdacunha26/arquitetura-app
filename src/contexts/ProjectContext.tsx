'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TeamMember } from './TeamContext';
import axios from 'axios';

export type ProjectStatus = 
  | 'START_DELAYED'
  | 'WAITING_START' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DELIVERY_DELAYED';

export const projectStatusLabels = {
  START_DELAYED: 'Início Atrasado',
  WAITING_START: 'Aguardando Início',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  DELIVERY_DELAYED: 'Entrega Atrasada'
};

export const projectStatusColors = {
  START_DELAYED: '#ff9800',
  WAITING_START: '#2196f3',
  IN_PROGRESS: '#4caf50',
  COMPLETED: '#9e9e9e',
  DELIVERY_DELAYED: '#f44336'
};

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  endDate: string;
  budget: number;
  clientId: string;
  paymentMethod: 'pix' | 'cartao';
  installmentCount: number;
  responsibleMember?: string; // ID do membro responsável
  installments?: Installment[]; // Array de parcelas
}

interface Installment {
  id: string;
  number: number;
  dueDate: string;
  value: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentDate?: string;
}

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  getProjectsByTeamMember: (memberId: string) => Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Residencial Vila Nova',
    description: 'Projeto de arquitetura residencial de alto padrão',
    status: 'IN_PROGRESS',
    endDate: '2024-07-30',
    budget: 500000,
    clientId: 'client1',
    paymentMethod: 'pix',
    installmentCount: 5,
    installments: [
      {
        id: '1-1',
        number: 1,
        dueDate: '2024-03-30',
        value: 100000,
        status: 'PAID',
        paymentDate: '2024-03-28'
      },
      {
        id: '1-2',
        number: 2,
        dueDate: '2024-04-30',
        value: 100000,
        status: 'PENDING'
      },
      {
        id: '1-3',
        number: 3,
        dueDate: '2024-05-30',
        value: 100000,
        status: 'PENDING'
      },
      {
        id: '1-4',
        number: 4,
        dueDate: '2024-06-30',
        value: 100000,
        status: 'PENDING'
      },
      {
        id: '1-5',
        number: 5,
        dueDate: '2024-07-30',
        value: 100000,
        status: 'PENDING'
      }
    ]
  },
  {
    id: '2',
    title: 'Comercial Centro',
    description: 'Reforma de espaço comercial no centro da cidade',
    status: 'WAITING_START',
    budget: 250000,
    clientId: 'client2',
    paymentMethod: 'cartao',
    installmentCount: 3,
    endDate: '2024-12-31',
    installments: [
      {
        id: '2-1',
        number: 1,
        dueDate: '2024-03-15',
        value: 83333.33,
        status: 'PAID',
        paymentDate: '2024-03-14'
      },
      {
        id: '2-2',
        number: 2,
        dueDate: '2024-03-01',
        value: 83333.33,
        status: 'OVERDUE'
      },
      {
        id: '2-3',
        number: 3,
        dueDate: '2024-04-15',
        value: 83333.34,
        status: 'PENDING'
      }
    ]
  }
];

// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProjectStatus = (project: Project): Project => {
    const today = new Date();
    const endDate = project.endDate ? new Date(project.endDate) : null;

    // Se o status já foi definido manualmente como Concluído, mantém
    if (project.status === 'COMPLETED') return project;

    // Se não tem data de prazo definida, mantém o status atual
    if (!endDate) return project;

    // Verifica status de prazo de entrega
    if (endDate < today && project.status !== 'COMPLETED') {
      return { ...project, status: 'DELIVERY_DELAYED' };
    }

    // Mantém o status atual se não se encaixar em nenhuma condição anterior
    return project;
  };

  const updateAllProjectsStatus = () => {
    setProjects(prev => prev.map(updateProjectStatus));
  };

  // Buscar projetos do backend
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/projects`);
      const fetchedProjects = response.data.map(updateProjectStatus);
      setProjects(fetchedProjects);
    } catch (err) {
      setError('Erro ao buscar projetos');
      console.error('Erro ao buscar projetos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar projeto no backend
  const addProject = async (project: Omit<Project, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProject = {
        ...project,
        id: crypto.randomUUID()
      };
      const response = await axios.post(`${API_URL}/projects`, newProject);
      const createdProject = updateProjectStatus(response.data);
      setProjects(prev => [...prev, createdProject]);
      return createdProject;
    } catch (err) {
      setError('Erro ao adicionar projeto');
      console.error('Erro ao adicionar projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar projeto no backend
  const updateProject = async (updatedProject: Project) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectWithStatus = updateProjectStatus(updatedProject);
      const response = await axios.put(`${API_URL}/projects/${updatedProject.id}`, projectWithStatus);
      setProjects(prev => 
        prev.map(project => 
          project.id === updatedProject.id 
            ? response.data 
            : project
        )
      );
      return response.data;
    } catch (err) {
      setError('Erro ao atualizar projeto');
      console.error('Erro ao atualizar projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir projeto no backend
  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      setError('Erro ao excluir projeto');
      console.error('Erro ao excluir projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar projetos por membro da equipe no backend
  const getProjectsByTeamMember = async (memberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/projects?memberId=${memberId}`);
      return response.data.map(updateProjectStatus);
    } catch (err) {
      setError('Erro ao buscar projetos do membro');
      console.error('Erro ao buscar projetos do membro:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar projetos ao montar o componente
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      setProjects,
      addProject,
      updateProject,
      deleteProject,
      getProjectsByTeamMember,
      isLoading,
      error,
      fetchProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 