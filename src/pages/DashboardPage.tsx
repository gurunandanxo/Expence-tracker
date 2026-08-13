import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedNumber from '@/components/shared/AnimatedNumber';
import {
  TrendingUp, TrendingDown, PiggyBank, Target, Percent,
  ArrowUpRight, ArrowDownRight, Wallet, Landmark, Plus, Trash2, X, CreditCard,
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { DEFAULT_CATEGORY_ICONS, BankAccount } from '@/types/expense';
import { motion, AnimatePresence } from 'framer-motion';

const CHART_COLORS = ['#00e5ff', '#ff3d81', '#7c4dff', '#00c853', '#ffab00', '#ff6e40', '#448aff', '#e040fb'];

function BankAccountModal({ onSave, onClose }: {
  onSave: (acc: Omit<BankAccount, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    accountNumber: '',
    balance: '',
    type: 'Savings' as BankAccount['type'],
    color: '#00e5ff',
  });

  const inputClass = "w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel neon-border p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Landmark className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-display font-bold">New Bank Account</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          if (!form.name.trim()) return;
          onSave({
            name: form.name.trim(),
            accountNumber: form.accountNumber.trim() ? (form.accountNumber.startsWith('*') ? form.accountNumber : `**** ${form.accountNumber.slice(-4)}`) : undefined,
            balance: parseFloat(form.balance || '0'),
            type: form.type,
            color: form.color,
          });
          onClose();
        }} className="space-y-4">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input className={inputClass} placeholder="e.g. HDFC Bank, SBI, ICICI" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Account / Card #</label>
              <input className={inputClass} placeholder="Last 4 digits" maxLength={10} value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Account Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as BankAccount['type'] }))}>
                <option value="Savings">Savings</option>
                <option value="Salary">Salary</option>
                <option value="Checking">Checking</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Initial Balance (₹)</label>
            <input type="number" step="0.01" className={`${inputClass} text-xl font-mono-nums font-bold`} placeholder="0.00" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} required />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_hsl(var(--astro-cyan)/0.3)] transition-all">
            Add Bank Account
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { transactions, goals, bankAccounts, addBankAccount, deleteBankAccount } = useData();
  const [showAddBank, setShowAddBank] = useState(false);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Cash transactions (paymentMode === 'Cash')
    const cashIncome = transactions.filter(t => t.type === 'income' && t.paymentMode === 'Cash').reduce((s, t) => s + t.amount, 0);
    const cashExpense = transactions.filter(t => t.type === 'expense' && t.paymentMode === 'Cash').reduce((s, t) => s + t.amount, 0);
    const cashBalance = cashIncome - cashExpense;

    // Total bank accounts sum
    const bankAccountsTotal = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

    return { income, expenses, savings, savingsRate, activeGoals: goals.length, cashBalance, bankAccountsTotal };
  }, [transactions, goals, bankAccounts]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const entry = map.get(month) || { income: 0, expense: 0 };
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(month, entry);
    });
    return Array.from(map, ([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions]
  );

  const summaryCards = [
    { label: 'Total Income', value: stats.income, icon: TrendingUp, color: 'text-astro-cyan', prefix: '₹' },
    { label: 'Total Expenses', value: stats.expenses, icon: TrendingDown, color: 'text-astro-pink', prefix: '₹' },
    { label: 'Net Savings', value: stats.savings, icon: PiggyBank, color: 'text-astro-violet', prefix: '₹' },
    { label: 'Savings Rate', value: stats.savingsRate, icon: Percent, color: 'text-astro-success', suffix: '%', decimals: 1, prefix: '' },
    { label: 'Active Goals', value: stats.activeGoals, icon: Target, color: 'text-astro-warning', prefix: '', decimals: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Command your capital.</p>
        </div>
        <button
          onClick={() => setShowAddBank(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/40 text-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary/10 hover:border-primary transition-all"
        >
          <Plus className="w-4 h-4" /> Add Bank Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map(card => (
          <GlassCard key={card.label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>
              <AnimatedNumber
                value={card.value}
                prefix={card.prefix ?? '₹'}
                decimals={card.decimals ?? 2}
              />
              {card.suffix}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Bank Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Landmark className="w-4 h-4 text-astro-cyan" /> Bank Accounts ({bankAccounts.length})
          </h2>
          <span className="text-xs font-mono-nums text-astro-cyan font-bold">
            Total Bank Balance: ₹{stats.bankAccountsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cash Balance Card */}
          <GlassCard className="relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cash Wallet</p>
                <h3 className="text-base font-bold text-foreground mt-0.5">Physical Cash</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-[hsl(145_70%_45%/0.12)] border border-[hsl(145_70%_45%/0.2)]">
                <Wallet className="w-5 h-5 text-[hsl(var(--astro-cash))]" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold font-mono-nums text-[hsl(var(--astro-cash))]">
                ₹{stats.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">In-hand physical currency</p>
            </div>
          </GlassCard>

          {/* Individual Bank Accounts */}
          {bankAccounts.map(acc => (
            <GlassCard key={acc.id} className="relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase">
                      {acc.type}
                    </span>
                    {acc.accountNumber && (
                      <span className="text-xs font-mono-nums text-muted-foreground">{acc.accountNumber}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1.5">{acc.name}</h3>
                </div>
                <button
                  onClick={() => deleteBankAccount(acc.id)}
                  title="Remove Account"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold font-mono-nums text-astro-cyan">
                  ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Available balance</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--astro-cyan))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--astro-cyan))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--astro-pink))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--astro-pink))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--astro-cyan))" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="hsl(var(--astro-pink))" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Category Distribution */}
        <GlassCard>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">By Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} stroke="none">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  {cat.name}
                </span>
                <span className="font-mono-nums text-muted-foreground">₹{cat.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <GlassCard>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{DEFAULT_CATEGORY_ICONS[t.category] ?? '📦'}</span>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {t.bankAccountName ? <span className="text-astro-cyan font-medium">{t.bankAccountName}</span> : t.paymentMode} · {t.date}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 font-mono-nums text-sm font-semibold ${t.type === 'income' ? 'text-astro-cyan' : 'text-astro-pink'}`}>
                {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {showAddBank && (
          <BankAccountModal
            onSave={addBankAccount}
            onClose={() => setShowAddBank(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
