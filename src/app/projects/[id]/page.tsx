'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  People as TeamIcon,
  Work as StagesIcon,
  AttachMoney as FinanceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { useProjects } from '@/contexts/ProjectContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { ProjectDetailsProvider } from '@/contexts/ProjectDetailsContext';
import ProjectStages from '@/components/ProjectStages';
import ProjectFinance from '@/components/ProjectFinance';
import ProjectTeam from '@/components/ProjectTeam';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProjectDetails() {
  const params = useParams();
  const { projects } = useProjects();
  const { members } = useTeamContext();
  const [activeTab, setActiveTab] = useState(0);
  const [project, setProject] = useState<any>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'BUDGET_IN_PROGRESS':
        return { label: 'Orçamento em Andamento', color: 'info' };
      case 'BUDGET_SENT':
        return { label: 'Orçamento Enviado', color: 'warning' };
      case 'BUDGET_APPROVED':
        return { label: 'Orçamento Aprovado', color: 'secondary' };
      case 'IN_PROGRESS':
        return { label: 'Em Execução', color: 'primary' };
      case 'COMPLETED':
        return { label: 'Concluído', color: 'success' };
      default:
        return { label: status, color: 'default' };
    }
  };

  useEffect(() => {
    console.log('Params ID:', params.id);
    console.log('All Projects:', projects);
    
    if (params.id) {
      const foundProject = projects.find(p => p.id === params.id);
      console.log('Found Project:', foundProject);
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        console.error('Projeto não encontrado com ID:', params.id);
      }
    }
  }, [params.id, projects]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Projeto não encontrado</Typography>
      </Container>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 0:
        return <ProjectTeam />;
      case 1:
        return <ProjectStages />;
      case 2:
        return <ProjectFinance />;
      default:
        return null;
    }
  };

  return (
    <ProjectDetailsProvider projectId={project.id}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.title}
            </Typography>
            {project.status && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={getStatusConfig(project.status).label}
                  color={getStatusConfig(project.status).color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                  size="small"
                  variant="filled"
                />
              </Box>
            )}
            <Typography variant="subtitle1" color="text.secondary">
              Cliente: {project.clientName}
            </Typography>
          </Box>
        </Box>

        {/* Informações do Projeto */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Descrição
              </Typography>
              <Typography variant="body1">
                {project.description}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações
              </Typography>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2">
                  <strong>Orçamento:</strong> {' '}
                  {Number(project.budget).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
                <Typography variant="body2">
                  <strong>Prazo:</strong> {' '}
                  {project.endDate 
                    ? format(new Date(project.endDate), 'dd/MM/yyyy', { locale: ptBR }) 
                    : 'Não definido'}
                </Typography>
                <Typography variant="body2">
                  <strong>Forma de Pagamento:</strong> {' '}
                  {project.paymentMethod === 'pix' ? 'PIX' : 'Parcelado'}
                </Typography>
                {project.paymentMethod !== 'pix' && (
                  <Typography variant="body2">
                    <strong>Parcelas:</strong> {project.installments || 1}x
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Abas */}
        <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<TeamIcon />} label="Equipe" />
            <Tab icon={<StagesIcon />} label="Etapas" />
            <Tab icon={<FinanceIcon />} label="Financeiro" />
          </Tabs>
        </Paper>

        <Box>
          {renderTabContent()}
        </Box>
      </Container>
    </ProjectDetailsProvider>
  );
} 