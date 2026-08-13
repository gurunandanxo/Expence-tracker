import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/shared/GlassCard';
import CustomDropdown from '@/components/shared/CustomDropdown';
import {
  Transaction, PAYMENT_MODES, DEFAULT_CATEGORY_ICONS, DEFAULT_EXPENSE_CATEGORIES,
  AVAILABLE_CATEGORY_ICONS, PaymentMode, TransactionType,
} from '@/types/expense';
import {
  Plus, Pencil, Trash2, Search, ArrowUpRight, ArrowDownRight, X,
  Banknote, Smartphone, CreditCard, Landmark, Globe, MoreHorizontal,
  LayoutGrid, SortAsc, FolderPlus, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_ICONS: Record<PaymentMode, React.ReactNode> = {
  Cash: <Banknote className="w-4 h-4" />,
  UPI: <Smartphone className="w-4 h-4" />,
  'Credit Card': <CreditCard className="w-4 h-4" />,
  'Debit Card': <CreditCard className="w-4 h-4" />,
  'Bank Transfer': <Landmark className="w-4 h-4" />,
  'Net Banking': <Globe className="w-4 h-4" />,
  Other: <MoreHorizontal className="w-4 h-4" />,
};

/* ─── Category Modal ─── */
function CategoryModal({ onSave, onClose }: { onSave: (name: string, icon: string) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_CATEGORY_ICONS[0].icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), selectedIcon);
    onClose();
  };

  const inputClass = "w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors";
  const labelClass = "text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
        className="w-full max-w-md glass-panel border border-border/50 p-6 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FolderPlus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-display font-bold">New Category</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Category Name</label>
            <input
              type="text"
              placeholder="e.g. Vacation, Gym, Salon..."
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              autoFocus
              required
            />
          </div>
          <div>
            <label className={labelClass}>Choose Icon</label>
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {AVAILABLE_CATEGORY_ICONS.map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  title={label}
                  onClick={() => setSelectedIcon(icon)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-all relative ${
                    selectedIcon === icon
                      ? 'bg-primary/15 border border-primary/40 text-primary'
                      : 'bg-muted/20 border border-transparent text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="truncate w-full text-center text-[10px]">{label}</span>
                  {selectedIcon === icon && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/50">
            <span className="text-2xl">{selectedIcon}</span>
            <span className="text-sm font-medium">{name || 'Category preview'}</span>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_hsl(var(--astro-cyan)/0.3)] transition-all"
          >
            Create Category
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Transaction Modal ─── */
function TransactionModal({ initial, allCategories, allCategoryIcons, bankAccounts, onSave, onClose }: {
  initial?: Transaction;
  allCategories: string[];
  allCategoryIcons: Record<string, string>;
  bankAccounts: { id: string; name: string }[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    amount: initial?.amount?.toString() || '',
    type: initial?.type || 'expense' as TransactionType,
    category: initial?.category || 'Food',
    paymentMode: initial?.paymentMode || 'Cash' as PaymentMode,
    bankAccountId: initial?.bankAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : ''),
    description: initial?.description || '',
    date: initial?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    const selectedBank = bankAccounts.find(b => b.id === form.bankAccountId);
    onSave({
      ...form,
      name: form.name || form.category,
      amount: parseFloat(form.amount),
      bankAccountId: form.bankAccountId || undefined,
      bankAccountName: selectedBank ? selectedBank.name : undefined,
    });
    onClose();
  };

  const inputClass = "w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors";
  const labelClass = "text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full w-full max-w-md glass-panel border-l border-border/50 p-6 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold">{initial ? 'Edit' : 'New'} Transaction</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Amount</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className={`${inputClass} text-3xl font-mono-nums font-bold h-16`} required />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" placeholder={form.category} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex gap-2">
                {(['income', 'expense'] as TransactionType[]).map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, type }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${form.type === type
                      ? type === 'income' ? 'bg-astro-cyan/20 text-astro-cyan border border-astro-cyan/30' : 'bg-astro-pink/20 text-astro-pink border border-astro-pink/30'
                      : 'bg-muted/30 text-muted-foreground border border-transparent'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <div className="grid grid-cols-4 gap-2">
              {allCategories.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${form.category === cat ? 'bg-primary/10 border border-primary/30 text-primary' : 'bg-muted/20 text-muted-foreground border border-transparent hover:bg-muted/40'}`}>
                  <span className="text-lg">{allCategoryIcons[cat] ?? '📦'}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_MODES.map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, paymentMode: m }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${form.paymentMode === m ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/20 text-muted-foreground border border-transparent hover:bg-muted/40'}`}>
                  {PAYMENT_ICONS[m]}
                  {m}
                </button>
              ))}
            </div>
          </div>
          {bankAccounts.length > 0 && form.paymentMode !== 'Cash' && (
            <div>
              <label className={labelClass}>Bank Account</label>
              <select
                className={inputClass}
                value={form.bankAccountId}
                onChange={e => setForm(f => ({ ...f, bankAccountId: e.target.value }))}
              >
                <option value="">No linked bank account</option>
                {bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputClass} h-20 resize-none`} placeholder="Optional note..." />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_hsl(var(--astro-cyan)/0.3)] transition-all">
            {initial ? 'Update' : 'Commit'} Transaction
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function TransactionsPage() {
  const { transactions, bankAccounts, addTransaction, updateTransaction, deleteTransaction, customCategories, addCustomCategory } = useData();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [modal, setModal] = useState<{ open: boolean; editing?: Transaction }>({ open: false });
  const [catModal, setCatModal] = useState(false);

  // Merge default + custom categories
  const allCategories = useMemo(() => [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...customCategories.map(c => c.name),
  ], [customCategories]);

  // Merged icon map
  const allCategoryIcons = useMemo(() => {
    const map: Record<string, string> = { ...DEFAULT_CATEGORY_ICONS };
    customCategories.forEach(c => { map[c.name] = c.icon; });
    return map;
  }, [customCategories]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') list = list.filter(t => t.category === filterCat);
    if (filterPayment !== 'all') list = list.filter(t => t.paymentMode === filterPayment);
    list.sort((a, b) => {
      if (sortBy === 'date') return b.date.localeCompare(a.date);
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.category.localeCompare(b.category);
    });
    return list;
  }, [transactions, search, filterCat, filterPayment, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">{transactions.length} records synchronized.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* New Category Button */}
          <button
            onClick={() => setCatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground text-sm font-semibold uppercase tracking-wider hover:bg-muted/40 hover:text-foreground transition-all"
          >
            <FolderPlus className="w-4 h-4" /> New Category
          </button>
          {/* New Entry Button */}
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_hsl(var(--astro-cyan)/0.4)] transition-all"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Custom Categories Pill Row */}
      {customCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Custom:</span>
          {customCategories.map(c => (
            <span key={c.name} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              <span>{c.icon}</span>{c.name}
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <GlassCard className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <CustomDropdown compact value={filterCat} onChange={setFilterCat}
          options={[
            { value: 'all', label: 'All Categories', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
            ...allCategories.map(c => ({ value: c, label: c, icon: <span className="text-sm">{allCategoryIcons[c] ?? '📦'}</span> })),
          ]}
        />
        <CustomDropdown compact value={filterPayment} onChange={setFilterPayment}
          options={[
            { value: 'all', label: 'All Payments', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
            ...PAYMENT_MODES.map(m => ({ value: m, label: m, icon: PAYMENT_ICONS[m] })),
          ]}
        />
        <CustomDropdown compact value={sortBy} onChange={v => setSortBy(v as typeof sortBy)}
          options={[
            { value: 'date', label: 'Sort: Date', icon: <SortAsc className="w-3.5 h-3.5" /> },
            { value: 'amount', label: 'Sort: Amount', icon: <SortAsc className="w-3.5 h-3.5" /> },
            { value: 'category', label: 'Sort: Category', icon: <SortAsc className="w-3.5 h-3.5" /> },
          ]}
        />
      </GlassCard>

      {/* Transaction List */}
      <div className="space-y-2">
        {filtered.map(t => (
          <GlassCard key={t.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{allCategoryIcons[t.category] ?? '📦'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} · {t.bankAccountName ? <span className="text-astro-cyan font-medium">{t.bankAccountName}</span> : t.paymentMode} · {t.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono-nums text-sm font-bold flex items-center gap-1 ${t.type === 'income' ? 'text-astro-cyan' : 'text-astro-pink'}`}>
                {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <button onClick={() => setModal({ open: true, editing: t })} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteTransaction(t.id)} className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No transactions found.</div>
        )}
      </div>

      <AnimatePresence>
        {catModal && (
          <CategoryModal
            onSave={addCustomCategory}
            onClose={() => setCatModal(false)}
          />
        )}
        {modal.open && (
          <TransactionModal
            initial={modal.editing}
            allCategories={allCategories}
            allCategoryIcons={allCategoryIcons}
            bankAccounts={bankAccounts}
            onSave={data => modal.editing ? updateTransaction({ ...modal.editing, ...data }) : addTransaction(data)}
            onClose={() => setModal({ open: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
