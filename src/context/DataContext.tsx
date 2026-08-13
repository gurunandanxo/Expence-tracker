import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Goal, CustomCategory, BankAccount, loadCustomCategories, saveCustomCategories } from '@/types/expense';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface DataContextType {
  transactions: Transaction[];
  goals: Goal[];
  bankAccounts: BankAccount[];
  loading: boolean;
  customCategories: CustomCategory[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  addCustomCategory: (name: string, icon: string) => void;
  addBankAccount: (acc: Omit<BankAccount, 'id' | 'createdAt'>) => void;
  updateBankAccount: (acc: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => storage.getBankAccounts());
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(loadCustomCategories);

  // Sync state changes to localStorage
  useEffect(() => {
    storage.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storage.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    storage.saveBankAccounts(bankAccounts);
  }, [bankAccounts]);

  const addBankAccount = useCallback((acc: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAcc: BankAccount = {
      ...acc,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setBankAccounts(prev => {
      const updated = [newAcc, ...prev];
      storage.saveBankAccounts(updated);
      return updated;
    });
    toast.success(`Bank Account "${acc.name}" added`);
  }, []);

  const updateBankAccount = useCallback((acc: BankAccount) => {
    setBankAccounts(prev => {
      const updated = prev.map(x => x.id === acc.id ? acc : x);
      storage.saveBankAccounts(updated);
      return updated;
    });
    toast.success(`Bank Account "${acc.name}" updated`);
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    setBankAccounts(prev => {
      const acc = prev.find(x => x.id === id);
      const updated = prev.filter(x => x.id !== id);
      storage.saveBankAccounts(updated);
      if (acc) toast.success(`Bank Account "${acc.name}" removed`);
      return updated;
    });
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    // Fill bank account name if bankAccountId is provided
    let accountName = t.bankAccountName;
    if (t.bankAccountId && !accountName) {
      const found = bankAccounts.find(a => a.id === t.bankAccountId);
      if (found) accountName = found.name;
    }

    const newTxn: Transaction = {
      ...t,
      bankAccountName: accountName,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => {
      const updated = [newTxn, ...prev];
      storage.saveTransactions(updated);
      return updated;
    });

    // Update bank balance if linked
    if (newTxn.bankAccountId) {
      setBankAccounts(prev => {
        const updated = prev.map(acc => {
          if (acc.id === newTxn.bankAccountId) {
            const diff = newTxn.type === 'income' ? newTxn.amount : -newTxn.amount;
            return { ...acc, balance: acc.balance + diff };
          }
          return acc;
        });
        storage.saveBankAccounts(updated);
        return updated;
      });
    }

    toast.success('Transaction added');
  }, [bankAccounts]);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => {
      const updated = prev.map(x => x.id === t.id ? t : x);
      storage.saveTransactions(updated);
      return updated;
    });
    toast.success('Transaction updated');
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const target = prev.find(x => x.id === id);
      if (target && target.bankAccountId) {
        setBankAccounts(accs => {
          const updated = accs.map(acc => {
            if (acc.id === target.bankAccountId) {
              const reverseDiff = target.type === 'income' ? -target.amount : target.amount;
              return { ...acc, balance: acc.balance + reverseDiff };
            }
            return acc;
          });
          storage.saveBankAccounts(updated);
          return updated;
        });
      }
      const updated = prev.filter(x => x.id !== id);
      storage.saveTransactions(updated);
      return updated;
    });
    toast.success('Transaction deleted');
  }, []);

  const addGoal = useCallback((g: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...g,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => {
      const updated = [newGoal, ...prev];
      storage.saveGoals(updated);
      return updated;
    });
    toast.success('Savings goal created');
  }, []);

  const updateGoal = useCallback((g: Goal) => {
    setGoals(prev => {
      const updated = prev.map(x => x.id === g.id ? g : x);
      storage.saveGoals(updated);
      return updated;
    });
    toast.success('Goal updated');
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(x => x.id !== id);
      storage.saveGoals(updated);
      return updated;
    });
    toast.success('Goal deleted');
  }, []);

  const addToGoal = useCallback((id: string, amount: number) => {
    setGoals(prev => {
      const target = prev.find(g => g.id === id);
      if (!target) return prev;
      const newAmount = Math.min(target.currentAmount + amount, target.targetAmount);
      const updated = prev.map(g => g.id === id ? { ...g, currentAmount: newAmount } : g);
      storage.saveGoals(updated);
      toast.success(`Added ₹${amount} to ${target.name}`);
      return updated;
    });
  }, []);

  const addCustomCategory = useCallback((name: string, icon: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCategories(prev => {
      if (prev.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
        toast.error('Category already exists');
        return prev;
      }
      const updated = [...prev, { name: trimmed, icon }];
      saveCustomCategories(updated);
      toast.success(`Category "${trimmed}" added`);
      return updated;
    });
  }, []);

  return (
    <DataContext.Provider value={{
      transactions, goals, bankAccounts, loading, customCategories,
      addTransaction, updateTransaction, deleteTransaction,
      addGoal, updateGoal, deleteGoal, addToGoal,
      addCustomCategory, addBankAccount, updateBankAccount, deleteBankAccount,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
