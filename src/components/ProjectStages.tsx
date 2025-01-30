'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { useTeamContext } from '@/contexts/TeamContext';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProjectStages() {
  const { 
    projectStages, 
    addProjectStage, 
    updateProjectStage, 
    deleteProjectStage,
    addTimelineEvent
  } = useProjectDetails();
  const { members } = useTeamContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);

  // Função para verificar e atualizar status das etapas
  const checkAndUpdateStageStatus = (stage: any) => {
    // Se a etapa já está concluída, não altera
    if (stage.status === 'COMPLETED') return stage;

    // Se tem data de prazo e já passou
    if (stage.endDate) {
      const stageEndDate = parseISO(stage.endDate);
      const today = new Date();

      if (isAfter(today, stageEndDate)) {
        return {
          ...stage,
          status: 'DELAYED'
        };
      }
    }

    return stage;
  };

  // Efeito para verificar status das etapas periodicamente
  useEffect(() => {
    const updatedStages = projectStages.map(checkAndUpdateStageStatus);
    
    // Atualiza apenas se houver mudanças
    const hasChanges = updatedStages.some((stage, index) => 
      JSON.stringify(stage) !== JSON.stringify(projectStages[index])
    );

    if (hasChanges) {
      updatedStages.forEach(stage => {
        if (stage.status !== projectStages.find(s => s.id === stage.id)?.status) {
          updateProjectStage(stage);
        }
      });
    }
  }, [projectStages]);

  const handleOpenDialog = (stage?: any) => {
    if (stage) {
      setEditingStage(stage);
    } else {
      setEditingStage({
        title: '',
        description: '',
        endDate: '',
        priority: 'LOW',
        responsibleMember: '',
        status: 'PENDING'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStage(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'DELAYED':
        return 'Atrasado';
      default:
        return status;
    }
  };

  const handleSaveStage = () => {
    if (editingStage.id) {
      // Atualizar etapa existente
      const updatedStage = checkAndUpdateStageStatus(editingStage);
      const oldStage = projectStages.find(s => s.id === editingStage.id);
      
      updateProjectStage(updatedStage);

      // Registrar evento na timeline
      const changes = [];
      
      if (oldStage?.status !== updatedStage.status) {
        changes.push(`Status alterado de "${getStatusLabel(oldStage?.status || '')}" para "${getStatusLabel(updatedStage.status)}"`);
      }
      
      // Garantir registro de mudança de responsável
      if (oldStage?.responsibleMember !== updatedStage.responsibleMember) {
        const oldMemberName = members.find(m => m.id === oldStage?.responsibleMember)?.name || 'Não atribuído';
        const newMemberName = members.find(m => m.id === updatedStage.responsibleMember)?.name || 'Não atribuído';
        
        changes.push(`Responsável alterado de "${oldMemberName}" para "${newMemberName}"`);
      }

      if (changes.length > 0) {
        addTimelineEvent({
          type: 'STAGE_STATUS',
          description: `Etapa "${updatedStage.title}" atualizada`,
          user: 'Usuário Atual', // Substituir pelo usuário logado
          oldValue: changes[0].replace('Status alterado de ', '').split(' para ')[0],
          newValue: changes[0].replace('Status alterado de ', '').split(' para ')[1]
        });
      }
    } else {
      // Adicionar nova etapa
      const newStage = {
        ...editingStage,
        id: crypto.randomUUID()
      };
      addProjectStage(newStage);

      // Registrar evento na timeline
      const responsibleName = members.find(m => m.id === newStage.responsibleMember)?.name || 'Não atribuído';
      
      addTimelineEvent({
        type: 'STAGE_STATUS',
        description: `Nova etapa "${newStage.title}" criada`,
        user: 'Usuário Atual', // Substituir pelo usuário logado
        newValue: `Status: ${getStatusLabel(newStage.status)}, Responsável: ${responsibleName}`
      });
    }
    handleCloseDialog();
  };

  const handleStatusChange = (stageId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    const stage = projectStages.find(s => s.id === stageId);
    if (stage) {
      const oldStatus = stage.status;
      updateProjectStage({ ...stage, status: newStatus });

      // Registrar evento na timeline
      addTimelineEvent({
        type: 'STAGE_STATUS',
        description: `Status da etapa "${stage.title}" alterado`,
        user: 'Usuário Atual', // Substituir pelo usuário logado
        oldValue: getStatusLabel(oldStatus),
        newValue: getStatusLabel(newStatus)
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'DELAYED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5">Etapas do Projeto</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Etapa
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Prazo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectStages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell>{stage.title}</TableCell>
                <TableCell>{stage.description}</TableCell>
                <TableCell>
                  {stage.endDate 
                    ? format(parseISO(stage.endDate), 'dd/MM/yyyy', { locale: ptBR }) 
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(stage.status)}
                    color={getStatusColor(stage.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(stage)}
                  >
                    Editar
                  </Button>
                  <Button 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteProjectStage(stage.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStage?.id ? 'Editar Etapa' : 'Nova Etapa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Título da Etapa"
                value={editingStage?.title || ''}
                onChange={(e) => setEditingStage((prev: any) => ({ 
                  ...prev, 
                  title: e.target.value 
                }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingStage?.status || 'PENDING'}
                  label="Status"
                  onChange={(e) => setEditingStage((prev: any) => ({ 
                    ...prev, 
                    status: e.target.value 
                  }))}
                >
                  <MenuItem value="PENDING">Pendente</MenuItem>
                  <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                  <MenuItem value="COMPLETED">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prazo para Entrega"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editingStage?.endDate || ''}
                onChange={(e) => setEditingStage((prev: any) => ({ 
                  ...prev, 
                  endDate: e.target.value 
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={editingStage?.priority || 'LOW'}
                  label="Prioridade"
                  onChange={(e) => setEditingStage((prev: any) => ({ 
                    ...prev, 
                    priority: e.target.value 
                  }))}
                >
                  <MenuItem value="LOW">Baixa</MenuItem>
                  <MenuItem value="MEDIUM">Média</MenuItem>
                  <MenuItem value="HIGH">Alta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Responsável</InputLabel>
                <Select
                  value={editingStage?.responsibleMember || ''}
                  label="Responsável"
                  onChange={(e) => setEditingStage((prev: any) => ({ 
                    ...prev, 
                    responsibleMember: e.target.value 
                  }))}
                >
                  <MenuItem value="">Selecione um membro</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={3}
                value={editingStage?.description || ''}
                onChange={(e) => setEditingStage((prev: any) => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveStage} 
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 