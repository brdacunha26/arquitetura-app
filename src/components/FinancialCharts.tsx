'use client';

import { Box, Typography, Paper } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  date: Date;
  project: string;
  category: string;
}

interface FinancialChartsProps {
  transactions: Transaction[];
}

export default function FinancialCharts({ transactions }: FinancialChartsProps) {
  // Preparar dados para o gráfico de linha (evolução do saldo)
  const lineChartData = {
    labels: transactions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(t => t.date.toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Saldo',
        data: transactions
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .reduce((acc: number[], transaction) => {
            const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
            const newValue = lastValue + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount);
            acc.push(newValue);
            return acc;
          }, []),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Preparar dados para o gráfico de barras (receitas x despesas por mês)
  const monthlyData = transactions.reduce((acc: { [key: string]: { income: number; expense: number } }, transaction) => {
    const monthYear = transaction.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'INCOME') {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expense += transaction.amount;
    }
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Receitas',
        data: Object.values(monthlyData).map(d => d.income),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Despesas',
        data: Object.values(monthlyData).map(d => d.expense),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Preparar dados para o gráfico de rosca (distribuição por categoria)
  const categoryData = transactions.reduce((acc: { [key: string]: number }, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += Math.abs(transaction.amount);
    return acc;
  }, {});

  const doughnutChartData = {
    labels: Object.keys(categoryData).map(cat => cat.replace('_', ' ')),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Análise Financeira
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Evolução do Saldo
          </Typography>
          <Line data={lineChartData} options={{ maintainAspectRatio: false }} height={200} />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Distribuição por Categoria
          </Typography>
          <Doughnut data={doughnutChartData} options={{ maintainAspectRatio: false }} height={200} />
        </Paper>
        <Paper sx={{ p: 2, gridColumn: '1 / -1' }}>
          <Typography variant="subtitle1" gutterBottom>
            Receitas x Despesas por Mês
          </Typography>
          <Bar data={barChartData} options={{ maintainAspectRatio: false }} height={200} />
        </Paper>
      </Box>
    </Box>
  );
} 