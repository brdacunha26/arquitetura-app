'use client';

import { useFinanceContext } from '@/contexts/FinanceContext';
import { useMemo } from 'react';
import { addDays, isBefore, isAfter } from 'date-fns';

export function useProjectFinances(projectId: string) {
  const { transactions, getTransactionsByProject } = useFinanceContext();

  const projectTransactions = useMemo(() => {
    return getTransactionsByProject(projectId);
  }, [getTransactionsByProject, projectId]);

  const financialSummary = useMemo(() => {
    return projectTransactions.reduce((acc, transaction) => {
      const amount = transaction.amount;
      if (transaction.type === 'INCOME') {
        acc.totalIncome += amount;
        if (transaction.status === 'COMPLETED') {
          acc.receivedIncome += amount;
        } else if (transaction.status === 'PENDING') {
          acc.pendingIncome += amount;
        } else if (transaction.status === 'OVERDUE') {
          acc.overdueIncome += amount;
        }
      } else {
        acc.totalExpenses += amount;
        if (transaction.status === 'COMPLETED') {
          acc.paidExpenses += amount;
        } else if (transaction.status === 'PENDING') {
          acc.pendingExpenses += amount;
        } else if (transaction.status === 'OVERDUE') {
          acc.overdueExpenses += amount;
        }
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      receivedIncome: 0,
      paidExpenses: 0,
      pendingIncome: 0,
      pendingExpenses: 0,
      overdueIncome: 0,
      overdueExpenses: 0,
      balance: 0,
      pendingBalance: 0,
    });
  }, [projectTransactions]);

  // Calcular saldos após redução
  financialSummary.balance = financialSummary.receivedIncome - financialSummary.paidExpenses;
  financialSummary.pendingBalance = financialSummary.pendingIncome - financialSummary.pendingExpenses;

  const paymentAlerts = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const overdue = projectTransactions.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      return isBefore(dueDate, today);
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    const upcoming = projectTransactions.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    return {
      overdue,
      upcoming
    };
  }, [projectTransactions]);

  const expensesByCategory = useMemo(() => {
    return projectTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Outros';
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            paid: 0,
            pending: 0,
            overdue: 0,
          };
        }
        acc[category].total += transaction.amount;
        if (transaction.status === 'COMPLETED') {
          acc[category].paid += transaction.amount;
        } else if (transaction.status === 'PENDING') {
          acc[category].pending += transaction.amount;
        } else if (transaction.status === 'OVERDUE') {
          acc[category].overdue += transaction.amount;
        }
        return acc;
      }, {} as Record<string, { total: number; paid: number; pending: number; overdue: number; }>);
  }, [projectTransactions]);

  const installments = useMemo(() => {
    return projectTransactions
      .filter(t => t.type === 'INCOME' && t.installmentNumber)
      .sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0));
  }, [projectTransactions]);

  return {
    projectTransactions,
    financialSummary,
    paymentAlerts,
    expensesByCategory,
    installments,
  };
} 