import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useData, getCurrentMonth, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormSelect, FormTextarea, ActionButtons } from '../components/Modal';
import { IncomeEntry } from '../types';

const CATS = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other'].map(v => ({ value: v.toLowerCase(), label: v }));

type Form = { source: string; amount: string; date: string; category: string; notes: string };
const defForm: Form = { source: '', amount: '', date: new Date().toISOString().slice(0, 10), category: 'salary', notes: '' };

export default function Income() {
  const { income, addIncome, updateIncome, deleteIncome, settings } = useData();
  const sym = settings.currencySymbol;
  const fmt = (n: number) => formatCurrency(n, sym);
  const cur = getCurrentMonth();

  const [modal, setModal] = useState<IncomeEntry | 'new' | null>(null);
  const [form, setForm] = useState<Form>(defForm);
  const [monthFilter, setMonthFilter] = useState(cur);

  const open = (item?: IncomeEntry) => {
    setForm(item ? { source: item.source, amount: String(item.amount), date: item.date, category: item.category, notes: item.notes || '' } : defForm);
    setModal(item ?? 'new');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { source: form.source, amount: parseFloat(form.amount) || 0, date: form.date, category: form.category, notes: form.notes };
    if (modal === 'new') await addIncome(data);
    else await updateIncome((modal as IncomeEntry).id, data);
    setModal(null);
  };

  const filtered = income.filter(i => i.date.startsWith(monthFilter)).sort((a, b) => b.date.localeCompare(a.date));
  const total = filtered.reduce((s, i) => s + i.amount, 0);

  const catTotals = filtered.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthlyTotal = income.filter(i => i.date.startsWith(cur)).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Income</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track all your income sources</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">This Month Total</div>
          <div className="text-xl font-bold text-emerald-400">{fmt(monthlyTotal)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Showing Period</div>
          <div className="text-xl font-bold text-white">{fmt(total)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Entries</div>
          <div className="text-xl font-bold text-white">{filtered.length}</div>
        </div>
      </div>

      {Object.keys(catTotals).length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <h3 className="text-sm font-semibold text-white mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{cat}</span>
                    <span className="text-emerald-400 font-medium">{fmt(amt)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-700">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${total > 0 ? (amt / total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <h2 className="font-semibold text-white">Income Entries</h2>
          <div className="flex items-center gap-2">
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              className="bg-gray-800 text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500" />
            <button onClick={() => open()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
              <Plus size={15} /> Add Income
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">No income entries for this period.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#10b981' + '20' }}>
                  <TrendingUp size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{item.source}</div>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">{item.category} · {new Date(item.date + 'T00:00:00').toLocaleDateString()}</div>
                </div>
                <span className="text-sm font-bold text-emerald-400">{fmt(item.amount)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => open(item)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => deleteIncome(item.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between px-5 py-3 text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-emerald-400">{fmt(total)}</span>
            </div>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? 'Add Income' : 'Edit Income'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <FormInput label="Source *" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} required placeholder="e.g. Salary, Freelance job" />
            <FormInput label="Amount *" type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <FormInput label="Date *" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            <FormSelect label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={CATS} />
            <FormTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <ActionButtons onCancel={() => setModal(null)} onDelete={modal !== 'new' ? () => { deleteIncome((modal as IncomeEntry).id); setModal(null); } : undefined} />
          </form>
        </Modal>
      )}
    </div>
  );
}
