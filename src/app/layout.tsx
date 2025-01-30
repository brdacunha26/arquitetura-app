'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { ClientProvider } from '@/contexts/ClientContext';
import { TeamProvider } from '@/contexts/TeamContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { ProjectStepsProvider } from '@/contexts/ProjectStepsContext';
import { TimelineProvider } from '@/contexts/TimelineContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <ClientProvider>
                <TeamProvider>
                  <ProjectProvider>
                    <ProjectStepsProvider>
                      <TaskProvider>
                        <FinanceProvider>
                          <TimelineProvider>
                            {children}
                          </TimelineProvider>
                        </FinanceProvider>
                      </TaskProvider>
                    </ProjectStepsProvider>
                  </ProjectProvider>
                </TeamProvider>
              </ClientProvider>
            </LocalizationProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 