import React from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import TeamList from './TeamList';

interface ProjectTeamProps {
  projectId: string;
}

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  return <TeamList projectId={projectId} />;
} 