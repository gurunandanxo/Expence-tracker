export type TransactionType = 'income' | 'expense';

// ExpenseCategory is now a string so custom categories are supported
export type ExpenseCategory = string;

export type PaymentMode = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Net Banking' | 'Other';

export interface BankAccount {
  id: string;
  name: string; // e.g. HDFC Bank, SBI, ICICI
  accountNumber?: string; // e.g. **** 4589
  balance: number;
  type: 'Savings' | 'Checking' | 'Salary' | 'Credit Card' | 'Other';
  color?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  paymentMode: PaymentMode;
  bankAccountId?: string;
  bankAccountName?: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline?: string;
  createdAt: string;
}

export interface CustomCategory {
  name: string;
  icon: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other',
];

// Keep EXPENSE_CATEGORIES as a getter that merges saved custom categories
export const EXPENSE_CATEGORIES: string[] = DEFAULT_EXPENSE_CATEGORIES;

export const PAYMENT_MODES: PaymentMode[] = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Net Banking', 'Other'];

export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Travel: '✈️',
  Shopping: '🛍️',
  Entertainment: '🎮',
  Health: '💊',
  Education: '📚',
  Bills: '📄',
  Other: '📦',
};

export const CATEGORY_ICONS: Record<string, string> = DEFAULT_CATEGORY_ICONS;

export const CUSTOM_CATEGORY_KEY = 'astro-custom-categories';
export const LEGACY_CUSTOM_CATEGORY_KEY = 'nebula-custom-categories';

export function loadCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORY_KEY) || localStorage.getItem(LEGACY_CUSTOM_CATEGORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(cats: CustomCategory[]): void {
  try {
    localStorage.setItem(CUSTOM_CATEGORY_KEY, JSON.stringify(cats));
  } catch {}
}

/** 20+ icon options users can assign to custom categories */
export const AVAILABLE_CATEGORY_ICONS: { icon: string; label: string }[] = [
  { icon: '🏠', label: 'Home' },
  { icon: '🚗', label: 'Car' },
  { icon: '✂️', label: 'Salon' },
  { icon: '🐾', label: 'Pets' },
  { icon: '🎵', label: 'Music' },
  { icon: '📱', label: 'Phone' },
  { icon: '💻', label: 'Tech' },
  { icon: '🏋️', label: 'Gym' },
  { icon: '☕', label: 'Coffee' },
  { icon: '🍷', label: 'Drinks' },
  { icon: '🎁', label: 'Gifts' },
  { icon: '🧴', label: 'Beauty' },
  { icon: '🏥', label: 'Hospital' },
  { icon: '📷', label: 'Camera' },
  { icon: '🎬', label: 'Movies' },
  { icon: '🏖️', label: 'Vacation' },
  { icon: '🧾', label: 'Tax' },
  { icon: '📦', label: 'Delivery' },
  { icon: '🌱', label: 'Garden' },
  { icon: '🔧', label: 'Repair' },
  { icon: '🎓', label: 'Tuition' },
  { icon: '⛽', label: 'Fuel' },
  { icon: '💈', label: 'Barber' },
  { icon: '🧹', label: 'Cleaning' },
  { icon: '📰', label: 'News' },
];
