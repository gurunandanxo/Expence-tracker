import { Transaction, Goal, BankAccount } from '@/types/expense';

const TRANSACTIONS_KEY = 'astro_transactions';
const LEGACY_TRANSACTIONS_KEY = 'nebula_transactions';
const GOALS_KEY = 'astro_goals';
const LEGACY_GOALS_KEY = 'nebula_goals';
const BANK_ACCOUNTS_KEY = 'astro_bank_accounts';
const LEGACY_BANK_ACCOUNTS_KEY = 'nebula_bank_accounts';

const SEED_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'acc-1', name: 'HDFC Bank', accountNumber: '**** 4892', balance: 45000, type: 'Savings', color: '#00e5ff', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acc-2', name: 'State Bank of India', accountNumber: '**** 9102', balance: 82500, type: 'Salary', color: '#7c4dff', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acc-3', name: 'ICICI Bank', accountNumber: '**** 3341', balance: 18200, type: 'Checking', color: '#ff3d81', createdAt: '2026-01-15T00:00:00Z' },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Freelance Payment', amount: 3500, type: 'income', category: 'Other', paymentMode: 'Bank Transfer', bankAccountId: 'acc-1', bankAccountName: 'HDFC Bank', description: 'March project', date: '2026-03-15', createdAt: '2026-03-15T10:00:00Z' },
  { id: '2', name: 'Grocery Shopping', amount: 127.50, type: 'expense', category: 'Food', paymentMode: 'Credit Card', bankAccountId: 'acc-3', bankAccountName: 'ICICI Bank', description: 'Weekly groceries', date: '2026-03-14', createdAt: '2026-03-14T14:00:00Z' },
  { id: '3', name: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'Entertainment', paymentMode: 'Credit Card', bankAccountId: 'acc-3', bankAccountName: 'ICICI Bank', description: 'Monthly sub', date: '2026-03-13', createdAt: '2026-03-13T08:00:00Z' },
  { id: '4', name: 'Gym Membership', amount: 49.99, type: 'expense', category: 'Health', paymentMode: 'Debit Card', bankAccountId: 'acc-1', bankAccountName: 'HDFC Bank', description: 'Monthly membership', date: '2026-03-12', createdAt: '2026-03-12T09:00:00Z' },
  { id: '5', name: 'Salary', amount: 5200, type: 'income', category: 'Other', paymentMode: 'Bank Transfer', bankAccountId: 'acc-2', bankAccountName: 'State Bank of India', description: 'March salary', date: '2026-03-01', createdAt: '2026-03-01T09:00:00Z' },
  { id: '6', name: 'Flight Tickets', amount: 450, type: 'expense', category: 'Travel', paymentMode: 'Credit Card', bankAccountId: 'acc-3', bankAccountName: 'ICICI Bank', description: 'Weekend trip', date: '2026-03-10', createdAt: '2026-03-10T11:00:00Z' },
  { id: '7', name: 'Online Course', amount: 79.99, type: 'expense', category: 'Education', paymentMode: 'UPI', bankAccountId: 'acc-1', bankAccountName: 'HDFC Bank', description: 'React advanced', date: '2026-03-08', createdAt: '2026-03-08T15:00:00Z' },
  { id: '8', name: 'Electric Bill', amount: 95, type: 'expense', category: 'Bills', paymentMode: 'Net Banking', bankAccountId: 'acc-2', bankAccountName: 'State Bank of India', description: 'March electricity', date: '2026-03-05', createdAt: '2026-03-05T10:00:00Z' },
  { id: '9', name: 'New Headphones', amount: 199.99, type: 'expense', category: 'Shopping', paymentMode: 'Credit Card', bankAccountId: 'acc-3', bankAccountName: 'ICICI Bank', description: 'Sony WH-1000XM5', date: '2026-03-07', createdAt: '2026-03-07T16:00:00Z' },
  { id: '10', name: 'Consulting Fee', amount: 1200, type: 'income', category: 'Other', paymentMode: 'Bank Transfer', bankAccountId: 'acc-1', bankAccountName: 'HDFC Bank', description: 'Advisory work', date: '2026-02-28', createdAt: '2026-02-28T10:00:00Z' },
  { id: '11', name: 'Restaurant Dinner', amount: 85, type: 'expense', category: 'Food', paymentMode: 'Cash', description: 'Birthday dinner', date: '2026-02-25', createdAt: '2026-02-25T20:00:00Z' },
  { id: '12', name: 'Uber Rides', amount: 42, type: 'expense', category: 'Travel', paymentMode: 'UPI', bankAccountId: 'acc-1', bankAccountName: 'HDFC Bank', description: 'Weekly commute', date: '2026-02-20', createdAt: '2026-02-20T18:00:00Z' },
];

const SEED_GOALS: Goal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, category: 'Savings', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'New Laptop', targetAmount: 2500, currentAmount: 1800, category: 'Tech', createdAt: '2026-02-01T00:00:00Z' },
  { id: '3', name: 'Vacation Fund', targetAmount: 5000, currentAmount: 1200, category: 'Travel', createdAt: '2026-01-15T00:00:00Z' },
];

function loadFromStorage<T>(key: string, legacyKey: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(legacyKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`, e);
  }
  // First time: save seed data
  saveToStorage(key, seed);
  return seed;
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const storage = {
  getTransactions: (): Transaction[] => loadFromStorage(TRANSACTIONS_KEY, LEGACY_TRANSACTIONS_KEY, SEED_TRANSACTIONS),
  saveTransactions: (data: Transaction[]) => saveToStorage(TRANSACTIONS_KEY, data),
  getGoals: (): Goal[] => loadFromStorage(GOALS_KEY, LEGACY_GOALS_KEY, SEED_GOALS),
  saveGoals: (data: Goal[]) => saveToStorage(GOALS_KEY, data),
  getBankAccounts: (): BankAccount[] => loadFromStorage(BANK_ACCOUNTS_KEY, LEGACY_BANK_ACCOUNTS_KEY, SEED_BANK_ACCOUNTS),
  saveBankAccounts: (data: BankAccount[]) => saveToStorage(BANK_ACCOUNTS_KEY, data),
};
