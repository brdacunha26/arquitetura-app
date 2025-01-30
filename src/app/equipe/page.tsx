'use client';

import { Box, Container, Divider } from '@mui/material';
import TeamForm from '@/components/TeamForm';
import TeamList from '@/components/TeamList';
import TeamMemberTasks from '@/components/TeamMemberTasks';

export default function TeamPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <TeamForm />
        <Divider sx={{ my: 4 }} />
        <TeamList />
        <Divider sx={{ my: 4 }} />
        <TeamMemberTasks />
      </Box>
    </Container>
  );
} 