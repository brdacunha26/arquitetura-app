'use client';

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import { useProjects } from '@/contexts/ProjectContext';

export default function ProjectSelector() {
  const { projects, selectedProject, setSelectedProject } = useProjects();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
        Projeto Atual:
      </Typography>
      <FormControl sx={{ minWidth: 300 }}>
        <InputLabel>Selecione um Projeto</InputLabel>
        <Select
          value={selectedProject?.id || ''}
          label="Selecione um Projeto"
          onChange={(e) => {
            const project = projects.find(p => p.id === e.target.value);
            setSelectedProject(project || null);
          }}
          displayEmpty
        >
          <MenuItem value="">
            <em>Todos os Projetos</em>
          </MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {project.title}
                <Chip
                  label={project.status}
                  size="small"
                  color={
                    project.status === 'ACTIVE' ? 'success' :
                    project.status === 'COMPLETED' ? 'default' :
                    project.status === 'ON_HOLD' ? 'warning' :
                    'error'
                  }
                  sx={{ ml: 1 }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 