'use client';

import { createContext, useContext, useState } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'ON_VACATION' | 'INACTIVE';
  avatar?: string;
  projects?: string[];
}

interface TeamContextType {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  updateMember: (member: TeamMember) => void;
  deleteMember: (memberId: string) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Silva',
    role: 'Arquiteta Principal',
    email: 'ana.silva@exemplo.com',
    phone: '(11) 98765-4321',
    status: 'ACTIVE',
    avatar: 'https://i.pravatar.cc/150?img=1',
    projects: ['Residencial Vila Nova', 'Comercial Centro']
  },
  {
    id: '2',
    name: 'Carlos Santos',
    role: 'Designer de Interiores',
    email: 'carlos.santos@exemplo.com',
    phone: '(11) 98765-4322',
    status: 'ON_VACATION',
    avatar: 'https://i.pravatar.cc/150?img=2',
    projects: ['Comercial Centro']
  },
  {
    id: '3',
    name: 'Mariana Costa',
    role: 'Arquiteta Júnior',
    email: 'mariana.costa@exemplo.com',
    phone: '(11) 98765-4323',
    status: 'ACTIVE',
    avatar: 'https://i.pravatar.cc/150?img=3',
    projects: ['Residencial Vila Nova']
  },
];

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  const addMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember = {
      ...member,
      id: crypto.randomUUID(),
      projects: member.projects || []
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (member: TeamMember) => {
    setMembers(prev => prev.map(m => m.id === member.id ? member : m));
  };

  const deleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  return (
    <TeamContext.Provider value={{
      members,
      setMembers,
      addMember,
      updateMember,
      deleteMember,
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
} 