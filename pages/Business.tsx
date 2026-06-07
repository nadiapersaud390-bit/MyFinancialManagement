import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useData, getCurrentMonth, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormSelect, FormTextarea, ActionButtons } from '../components/Modal';
import { BusinessEntry } from '../types';

const CATS = ['Sales', 'Services', 'Consulting', 'Rent', 'Supplies', 'Marketing', 'Payroll', 'Utilities', 'Tax', 'Other'].map(v => ({ value: v.toLowerCase(), label: v }));

type Form = { description: string; amount: string; type: 'income' | 'expense'; date: string; category: string; notes: string };
const defForm: Form = { description: '', amount: '', type: 'income', date: new Date().toISOString().slice(0, 10), category: 'sales', notes: '' };

export default function Business() {
  const { businessEntries, addBusinessEntry, updateBusinessEntry, deleteBusinessEntry, settings } = useData();
  const sym = settings.currencySymbol;
  const fmt = (n: number) => formatCurrency(n, sym);
  const cur = getCurrentMonth();

  const [modal, setModal] = useState<BusinessEntry | 'new' | null>(null);
  const [form, setForm] = useState<Form>(defForm);
  const [monthFilter, setMonthFilter] = useState(cur);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const open = (item?: BusinessEntry) => {
    setForm(item ? { description: item.description, amount: String(item.amount), type: item.type, date: item.date, category: item.category, notes: item.notes || '' } : defForm);
    setModal(item ?? 'new');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { description: form.description, amount: parseFloat(form.amount) || 0, type: form.type, date: form.date, category: form.category, notes: form.notes };
    if (modal === 'new') await addBusinessEntry(data);
    else await updateBusinessEntry((modal as BusinessEntry).id, data);
    setModal(null);
  };

  const filtered = businessEntries
    .filter(e => e.date.startsWith(monthFilter) && (typeFilter === 'all' || e.type === typeFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const monthIncome = businessEntries.filter(e => e.date.startsWith(monthFilter) && e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const monthExpenses = businessEntries.filter(e => e.date.startsWith(monthFilter) && e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const profit = monthIncome - monthExpenses;

  return (
    <div className="p-6 max-w-[1000px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Business</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your business income and expenses</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Revenue</div>
          <div className="text-xl font-bold text-emerald-400">{fmt(monthIncome)}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Expenses</div>
          <div className="text-xl font-bold text-red-400">{fmt(monthExpenses)}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: `1px solid ${profit >= 0 ? '#10b98140' : '#ef444440'}` }}>
          <div className="text-xs text-gray-500 mb-1">Net Profit</div>
          <div className="text-xl font-bold" style={{ color: profit >= 0 ? '#10b981' : '#ef4444' }}>
            {profit < 0 ? '-' : ''}{fmt(Math.abs(profit))}
          </div>
        </div>
      </div>

      {monthIncome > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Profit Margin</span>
            <span className="text-gray-400">{monthIncome > 0 ? ((profit / monthIncome) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-700">
            <div className="h-full rounded-full" style={{ width: `${monthIncome > 0 ? Math.max(0, (monthExpenses / monthIncome) * 100) : 0}%`, background: '#ef4444' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Expenses: {fmt(monthExpenses)}</span>
            <span>Revenue: {fmt(monthIncome)}</span>
          </div>
        </div>
      )}

      <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <div className="flex items-center gap-2">
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              className="bg-gray-800 text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500" />
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all capitalize"
                  style={{ background: typeFilter === t ? '#10b981' : 'transparent', color: typeFilter === t ? '#fff' : '#9ca3af' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => open()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
            <Plus size={15} /> Add Entry
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">No entries for this period.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: entry.type === 'income' ? '#10b98120' : '#ef444420' }}>
                  {entry.type === 'income' ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{entry.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">{entry.category} · {new Date(entry.date + 'T00:00:00').toLocaleDateString()}</div>
                </div>
                <span className={`text-sm font-bold ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => open(entry)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => deleteBusinessEntry(entry.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? 'Add Business Entry' : 'Edit Entry'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <FormInput label="Description *" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required placeholder="What is this entry for?" />
            <FormInput label="Amount *" type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <div className="flex gap-3">
                {(['income', 'expense'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                    style={{ background: form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : '#2d3748', color: form.type === t ? '#fff' : '#9ca3af' }}>
                    {t === 'income' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>
            </div>
            <FormInput label="Date *" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            <FormSelect label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={CATS} />
            <FormTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <ActionButtons onCancel={() => setModal(null)} onDelete={modal !== 'new' ? () => { deleteBusinessEntry((modal as BusinessEntry).id); setModal(null); } : undefined} />
          </form>
        </Modal>
      )}
    </div>
  );
}
