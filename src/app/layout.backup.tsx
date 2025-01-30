import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { FinanceProvider } from '@/contexts/FinanceContext';
import ThemeRegistry from '@/components/ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestão de Projetos',
  description: 'Sistema para gerenciamento de projetos arquitetônicos',
};

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
            <FinanceProvider>
              {children}
            </FinanceProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 