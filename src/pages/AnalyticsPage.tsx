import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/shared/GlassCard';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/types/expense';

const COLORS = ['#00e5ff', '#ff3d81', '#7c4dff', '#00c853', '#ffab00', '#ff6e40', '#448aff', '#e040fb'];
const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' };

export default function AnalyticsPage() {
  const { transactions } = useData();

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return DEFAULT_EXPENSE_CATEGORIES.map(c => ({ name: c, value: map.get(c) || 0 })).filter(c => c.value > 0);
  }, [transactions]);

  const incomeVsExpense = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const e = map.get(month) || { income: 0, expense: 0 };
      if (t.type === 'income') e.income += t.amount; else e.expense += t.amount;
      map.set(month, e);
    });
    return Array.from(map, ([month, d]) => ({ month, ...d })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const month = t.date.substring(0, 7);
      map.set(month, (map.get(month) || 0) + t.amount);
    });
    return Array.from(map, ([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const savingsRate = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const e = map.get(month) || { income: 0, expense: 0 };
      if (t.type === 'income') e.income += t.amount; else e.expense += t.amount;
      map.set(month, e);
    });
    return Array.from(map, ([month, d]) => ({
      month,
      rate: d.income > 0 ? ((d.income - d.expense) / d.income) * 100 : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep-scan your financial telemetry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Distribution */}
        <GlassCard>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Category Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} strokeWidth={1} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Income vs Expense */}
        <GlassCard>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Income vs Expense</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 18%)" />
                <XAxis dataKey="month" stroke="#9aa4c2" fontSize={12} tickLine={false} />
                <YAxis stroke="#9aa4c2" fontSize={12} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                <Bar dataKey="income" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ff3d81" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Monthly Spending Trend */}
        <GlassCard>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Monthly Spending Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c4dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 18%)" />
                <XAxis dataKey="month" stroke="#9aa4c2" fontSize={12} tickLine={false} />
                <YAxis stroke="#9aa4c2" fontSize={12} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="total" stroke="#7c4dff" fill="url(#trendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Savings Rate */}
        <GlassCard>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Savings Rate</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 20% 18%)" />
                <XAxis dataKey="month" stroke="#9aa4c2" fontSize={12} tickLine={false} />
                <YAxis stroke="#9aa4c2" fontSize={12} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#00c853" strokeWidth={2} dot={{ fill: '#00c853', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
