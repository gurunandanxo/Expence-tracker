import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/shared/GlassCard';
import CustomDropdown from '@/components/shared/CustomDropdown';
import { EXPENSE_CATEGORIES, PAYMENT_MODES, CATEGORY_ICONS } from '@/types/expense';
import { FileText, Table, FileSpreadsheet, Banknote, Smartphone, CreditCard, Landmark, Globe, MoreHorizontal, ArrowUpRight, ArrowDownRight, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  Cash: <Banknote className="w-3.5 h-3.5" />,
  UPI: <Smartphone className="w-3.5 h-3.5" />,
  'Credit Card': <CreditCard className="w-3.5 h-3.5" />,
  'Debit Card': <CreditCard className="w-3.5 h-3.5" />,
  'Bank Transfer': <Landmark className="w-3.5 h-3.5" />,
  'Net Banking': <Globe className="w-3.5 h-3.5" />,
  Other: <MoreHorizontal className="w-3.5 h-3.5" />,
};

export default function ExportPage() {
  const { transactions } = useData();
  const [daysFilter, setDaysFilter] = useState<number | null>(30);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (daysFilter && !dateFrom && !dateTo) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysFilter);
      list = list.filter(t => new Date(t.date) >= cutoff);
    }
    if (dateFrom) list = list.filter(t => t.date >= dateFrom);
    if (dateTo) list = list.filter(t => t.date <= dateTo);
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory);
    if (filterPayment !== 'all') list = list.filter(t => t.paymentMode === filterPayment);
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, daysFilter, dateFrom, dateTo, filterCategory, filterPayment, filterType]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const fileName = () => `Expense_Report_${new Date().toISOString().split('T')[0]}`;

  const exportCSV = () => {
    const headers = 'Name,Amount,Type,Category,Payment Mode,Date,Description\n';
    const rows = filtered.map(t => `"${t.name}",${t.amount},${t.type},"${t.category}","${t.paymentMode}",${t.date},"${t.description}"`).join('\n');
    download(headers + rows, `${fileName()}.csv`, 'text/csv');
  };

  const exportExcel = () => {
    // Simple HTML table that Excel can open
    const html = `<html><head><meta charset="utf-8"></head><body>
      <table border="1"><tr><th>Name</th><th>Amount</th><th>Type</th><th>Category</th><th>Payment</th><th>Date</th><th>Description</th></tr>
      ${filtered.map(t => `<tr><td>${t.name}</td><td>${t.amount}</td><td>${t.type}</td><td>${t.category}</td><td>${t.paymentMode}</td><td>${t.date}</td><td>${t.description}</td></tr>`).join('')}
      </table></body></html>`;
    download(html, `${fileName()}.xls`, 'application/vnd.ms-excel');
  };

  const exportPDF = () => {
    // Print-based PDF
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${fileName()}</title><style>
      body{font-family:sans-serif;padding:20px;background:#0b0f1a;color:#fff}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #333;padding:8px;text-align:left;font-size:12px}
      th{background:#141a2e;color:#00e5ff}
      .income{color:#00e5ff} .expense{color:#ff3d81}
      h1{color:#00e5ff;font-size:20px} .meta{color:#9aa4c2;font-size:13px}
    </style></head><body>
      <h1>Astro Expense Report</h1>
      <p class="meta">Generated: ${new Date().toLocaleString()} | Records: ${filtered.length} | Income: ₹${totalIncome.toFixed(2)} | Expenses: ₹${totalExpense.toFixed(2)}</p>
      <table><tr><th>Name</th><th>Amount</th><th>Type</th><th>Category</th><th>Payment</th><th>Date</th></tr>
      ${filtered.map(t => `<tr><td>${t.name}</td><td>₹${t.amount.toFixed(2)}</td><td class="${t.type}">${t.type}</td><td>${t.category}</td><td>${t.paymentMode}</td><td>${t.date}</td></tr>`).join('')}
      </table></body></html>`);
    w.document.close();
    w.print();
  };

  const download = (content: string, name: string, type: string) => {
    setExporting(true);
    setTimeout(() => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 600);
  };

  const presetDays = [7, 30, 90, 365];
  const inputClass = "bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors";
  const selectClass = "bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate filtered financial reports.</p>
      </div>

      {/* Quick Day Presets */}
      <GlassCard>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Quick Filter</h3>
        <div className="flex flex-wrap gap-2">
          {presetDays.map(d => (
            <button key={d} onClick={() => { setDaysFilter(d); setDateFrom(''); setDateTo(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${daysFilter === d && !dateFrom
                ? 'bg-primary/15 text-primary border border-primary/30 glow-cyan'
                : 'bg-muted/20 text-muted-foreground border border-transparent hover:bg-muted/40'}`}>
              Last {d} days
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Custom Date + Filters */}
      <GlassCard>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Advanced Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setDaysFilter(null); }} className={`w-full ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setDaysFilter(null); }} className={`w-full ${inputClass}`} />
          </div>
          <CustomDropdown label="Category" value={filterCategory} onChange={setFilterCategory}
            options={[
              { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c, icon: <span className="text-sm">{CATEGORY_ICONS[c]}</span> })),
            ]}
          />
          <CustomDropdown label="Payment" value={filterPayment} onChange={setFilterPayment}
            options={[
              { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              ...PAYMENT_MODES.map(m => ({ value: m, label: m, icon: PAYMENT_ICONS[m] })),
            ]}
          />
          <CustomDropdown label="Type" value={filterType} onChange={setFilterType}
            options={[
              { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { value: 'income', label: 'Income', icon: <ArrowUpRight className="w-3.5 h-3.5 text-astro-cyan" /> },
              { value: 'expense', label: 'Expense', icon: <ArrowDownRight className="w-3.5 h-3.5 text-astro-pink" /> },
            ]}
          />
        </div>
      </GlassCard>

      {/* Preview */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Preview — <span className="font-mono-nums text-primary">{filtered.length}</span> records</h3>
          <div className="flex gap-2 text-xs font-mono-nums">
            <span className="text-astro-cyan">↑ ₹{totalIncome.toFixed(2)}</span>
            <span className="text-astro-pink">↓ ₹{totalExpense.toFixed(2)}</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-right py-2 px-3">Amount</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-left py-2 px-3">Payment</th>
                <th className="text-left py-2 px-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(t => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3">{t.name}</td>
                  <td className={`py-2 px-3 text-right font-mono-nums ${t.type === 'income' ? 'text-astro-cyan' : 'text-astro-pink'}`}>₹{t.amount.toFixed(2)}</td>
                  <td className="py-2 px-3 capitalize">{t.type}</td>
                  <td className="py-2 px-3">{t.category}</td>
                  <td className="py-2 px-3">{t.paymentMode}</td>
                  <td className="py-2 px-3 font-mono-nums">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 50 && <p className="text-xs text-muted-foreground text-center py-2">Showing 50 of {filtered.length} records</p>}
        </div>
      </GlassCard>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Export CSV', icon: Table, fn: exportCSV },
          { label: 'Export Excel', icon: FileSpreadsheet, fn: exportExcel },
          { label: 'Export PDF', icon: FileText, fn: exportPDF },
        ].map(opt => (
          <button key={opt.label} onClick={opt.fn} disabled={filtered.length === 0 || exporting}
            className="glass-panel glass-panel-hover flex items-center justify-center gap-3 p-4 text-sm font-semibold uppercase tracking-wider text-primary border border-primary/20 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <opt.icon className="w-5 h-5" />
            {opt.label}
          </button>
        ))}
      </div>

      {exporting && (
        <div className="h-1.5 rounded-full overflow-hidden bg-muted/30">
          <motion.div className="h-full progress-glow" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.6 }} />
        </div>
      )}
    </div>
  );
}
