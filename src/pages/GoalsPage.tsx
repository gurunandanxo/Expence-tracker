import { useState } from 'react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedNumber from '@/components/shared/AnimatedNumber';
import { Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function GoalModal({ onSave, onClose }: { onSave: (data: { name: string; targetAmount: number; currentAmount: number; category: string }) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', category: 'Savings' });
  const inputClass = "w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel neon-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold">New Savings Goal</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount || '0') }); onClose(); }} className="space-y-4">
          <div><label className={labelClass}>Goal Name</label><input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Emergency Fund" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Target</label><input type="number" step="0.01" className={inputClass} value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} placeholder="10000" required /></div>
            <div><label className={labelClass}>Current</label><input type="number" step="0.01" className={inputClass} value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} placeholder="0" /></div>
          </div>
          <div><label className={labelClass}>Category</label><input className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Savings, Travel, Tech..." /></div>
          <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_hsl(187_100%_50%/0.3)] transition-all">Create Goal</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AddFundsModal({ goal, onAdd, onClose }: { goal: { name: string; targetAmount: number; currentAmount: number }; onAdd: (amount: number) => void; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.currentAmount;
  const inputClass = "w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel neon-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-display font-bold mb-1">Fund: {goal.name}</h2>
        <p className="text-xs text-muted-foreground mb-4">Remaining: <span className="font-mono-nums text-astro-cyan">₹{remaining.toFixed(2)}</span></p>
        <form onSubmit={e => { e.preventDefault(); if (parseFloat(amount) > 0) { onAdd(parseFloat(amount)); onClose(); } }} className="space-y-4">
          <input type="number" step="0.01" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} className={`${inputClass} text-2xl font-mono-nums h-14`} placeholder="0.00" required />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted/30 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-[0_0_15px_hsl(187_100%_50%/0.3)] transition-all">Add Funds</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function GoalsPage() {
  const { goals, addGoal, deleteGoal, addToGoal } = useData();
  const [showNew, setShowNew] = useState(false);
  const [fundingGoal, setFundingGoal] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your financial trajectory.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_hsl(187_100%_50%/0.4)] transition-all">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
          const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <GlassCard key={goal.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold">{goal.name}</h3>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{goal.category}</span>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-xl font-bold text-astro-cyan"><AnimatedNumber value={goal.currentAmount} /></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-sm font-mono-nums text-muted-foreground">₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full progress-glow rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-mono-nums">{pct.toFixed(1)}% complete</p>
              </div>
              <button onClick={() => setFundingGoal(goal.id)}
                className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                + Add Funds
              </button>
            </GlassCard>
          );
        })}
      </div>

      {goals.length === 0 && <div className="text-center py-16 text-muted-foreground">No goals yet. Create your first savings target.</div>}

      <AnimatePresence>
        {showNew && <GoalModal onSave={data => addGoal(data)} onClose={() => setShowNew(false)} />}
        {fundingGoal && (() => {
          const g = goals.find(x => x.id === fundingGoal);
          return g ? <AddFundsModal goal={g} onAdd={amt => addToGoal(fundingGoal, amt)} onClose={() => setFundingGoal(null)} /> : null;
        })()}
      </AnimatePresence>
    </div>
  );
}
