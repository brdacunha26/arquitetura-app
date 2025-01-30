'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/theme';
import { TeamProvider } from '@/contexts/TeamContext';
import { TaskProvider } from '@/contexts/TaskContext';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TeamProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </TeamProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
} 