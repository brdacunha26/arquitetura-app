'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useProjects, Project } from './ProjectContext';

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  projectId?: string;
  budget?: number;
  dueDate?: string;
  paidAt?: string;
  installmentNumber?: number;
}

interface FormData {
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  date: string;
  projectId?: string;
  category: string;
  dueDate?: string;
  installmentNumber?: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  editingTransaction: Transaction | null;
  setEditingTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  getTransactionsByProject: (projectId: string) => Transaction[];
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTransactionsByStatus: (status: Transaction['status']) => Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialFormData: FormData = {
  description: '',
  amount: '',
  type: 'INCOME',
  status: 'PENDING',
  date: new Date().toISOString().split('T')[0],
  projectId: '',
  category: '',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { projects } = useProjects();

  // Adicionar transação
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID()
      };
      setTransactions(prev => [...prev, newTransaction]);
    } catch (err) {
      setError('Erro ao adicionar transação');
      console.error('Erro ao adicionar transação:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar transação
  const updateTransaction = async (transaction: Transaction) => {
    setIsLoading(true);
    setError(null);
    try {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } catch (err) {
      setError('Erro ao atualizar transação');
      console.error('Erro ao atualizar transação:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir transação
  const deleteTransaction = async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      setError('Erro ao excluir transação');
      console.error('Erro ao excluir transação:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de filtro
  const getTransactionsByProject = (projectId: string) => {
    return transactions.filter(t => t.projectId === projectId);
  };

  const getTransactionsByType = (type: Transaction['type']) => {
    return transactions.filter(t => t.type === type);
  };

  const getTransactionsByStatus = (status: Transaction['status']) => {
    return transactions.filter(t => t.status === status);
  };

  // Sincronizar transações quando houver mudanças nos projetos
  useEffect(() => {
    const syncProjectTransactions = async () => {
      for (const project of projects) {
        if (project.installments) {
          for (const installment of project.installments) {
            const existingTransaction = transactions.find(
              t => t.projectId === project.id && t.installmentNumber === installment.number
            );

            if (!existingTransaction) {
              const newTransaction: Omit<Transaction, 'id'> = {
                type: 'INCOME',
                description: `${project.title} - Parcela ${installment.number}`,
                amount: installment.value,
                date: installment.dueDate,
                category: 'Projetos',
                status: installment.status,
                projectId: project.id,
                installmentNumber: installment.number,
                dueDate: installment.dueDate,
                paidAt: installment.paymentDate,
                budget: project.budget
              };

              await addTransaction(newTransaction);
            }
          }
        }
      }
    };

    syncProjectTransactions();
  }, [projects]);

  return (
    <FinanceContext.Provider value={{
      transactions,
      setTransactions,
      editingTransaction,
      setEditingTransaction,
      isDialogOpen,
      setIsDialogOpen,
      formData,
      setFormData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionsByProject,
      getTransactionsByType,
      getTransactionsByStatus,
      isLoading,
      error
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
} 