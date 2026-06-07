import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, HandCoins } from 'lucide-react';
import { useData, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormSelect, FormTextarea, ActionButtons } from '../components/Modal';
import { Loan } from '../types';

type Form = { person: string; amount: string; type: 'owe' | 'owed'; startDate: string; dueDate: string; notes: string };
const defForm: Form = { person: '', amount: '', type: 'owe', startDate: new Date().toISOString().slice(0, 10), dueDate: '', notes: '' };

export default function Loans() {
  const { loans, addLoan, updateLoan, deleteLoan, settings } = useData();
  const sym = settings.currencySymbol;
  const fmt = (n: number) => formatCurrency(n, sym);

  const [tab, setTab] = useState<'owe' | 'owed'>('owe');
  const [modal, setModal] = useState<Loan | 'new' | null>(null);
  const [form, setForm] = useState<Form>(defForm);

  const open = (item?: Loan, defaultType?: 'owe' | 'owed') => {
    setForm(item
      ? { person: item.person, amount: String(item.amount), type: item.type, startDate: item.startDate, dueDate: item.dueDate || '', notes: item.notes || '' }
      : { ...defForm, type: defaultType || tab });
    setModal(item ?? 'new');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { person: form.person, amount: parseFloat(form.amount) || 0, type: form.type, startDate: form.startDate, dueDate: form.dueDate, notes: form.notes, paid: modal !== 'new' ? (modal as Loan).paid : false };
    if (modal === 'new') await addLoan(data);
    else await updateLoan((modal as Loan).id, data);
    setModal(null);
  };

  const oweLoans = loans.filter(l => l.type === 'owe');
  const owedLoans = loans.filter(l => l.type === 'owed');
  const displayed = tab === 'owe' ? oweLoans : owedLoans;

  const totalOwe = oweLoans.filter(l => !l.paid).reduce((s, l) => s + l.amount, 0);
  const totalOwed = owedLoans.filter(l => !l.paid).reduce((s, l) => s + l.amount, 0);

  return (
    <div className="p-6 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Loans</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track money you owe and money owed to you</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">I Owe (Outstanding)</div>
          <div className="text-2xl font-bold text-yellow-400">{fmt(totalOwe)}</div>
          <div className="text-xs text-gray-500 mt-1">{oweLoans.filter(l => !l.paid).length} active loans</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Owed to Me (Outstanding)</div>
          <div className="text-2xl font-bold text-emerald-400">{fmt(totalOwed)}</div>
          <div className="text-xs text-gray-500 mt-1">{owedLoans.filter(l => !l.paid).length} active loans</div>
        </div>
      </div>

      <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {(['owe', 'owed'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{ background: tab === t ? '#10b981' : 'transparent', color: tab === t ? '#fff' : '#9ca3af' }}>
                {t === 'owe' ? 'I Owe' : 'Owed to Me'}
              </button>
            ))}
          </div>
          <button onClick={() => open(undefined, tab)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
            <Plus size={15} /> Add Loan
          </button>
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <HandCoins size={32} className="mx-auto mb-3" />
            <p className="text-sm">No loans recorded.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {displayed.sort((a, b) => (a.paid ? 1 : 0) - (b.paid ? 1 : 0)).map(loan => {
              const isOverdue = !loan.paid && loan.dueDate && new Date(loan.dueDate) < new Date();
              return (
                <div key={loan.id} className="flex items-center gap-3 px-5 py-4">
                  <button onClick={() => updateLoan(loan.id, { paid: !loan.paid })}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ borderColor: loan.paid ? '#10b981' : '#374151', background: loan.paid ? '#10b981' : 'transparent' }}>
                    {loan.paid && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${loan.paid ? 'text-gray-500 line-through' : 'text-white'}`}>{loan.person}</span>
                      {loan.paid && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Paid</span>}
                      {isOverdue && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Overdue</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Started: {new Date(loan.startDate + 'T00:00:00').toLocaleDateString()}
                      {loan.dueDate && ` · Due: ${new Date(loan.dueDate + 'T00:00:00').toLocaleDateString()}`}
                      {loan.notes && ` · ${loan.notes}`}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${loan.paid ? 'text-gray-600' : tab === 'owe' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {fmt(loan.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => open(loan)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => deleteLoan(loan.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? 'Add Loan' : 'Edit Loan'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <FormInput label="Person / Organisation *" value={form.person} onChange={e => setForm(p => ({ ...p, person: e.target.value }))} required placeholder="Who is involved?" />
            <FormInput label="Amount *" type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <div className="flex gap-3">
                {(['owe', 'owed'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: form.type === t ? '#10b981' : '#2d3748', color: form.type === t ? '#fff' : '#9ca3af' }}>
                    {t === 'owe' ? 'I Owe Them' : 'They Owe Me'}
                  </button>
                ))}
              </div>
            </div>
            <FormInput label="Start Date" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            <FormInput label="Due Date (optional)" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            <FormTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Car loan, borrowed for rent" />
            <ActionButtons onCancel={() => setModal(null)} onDelete={modal !== 'new' ? () => { deleteLoan((modal as Loan).id); setModal(null); } : undefined} />
          </form>
        </Modal>
      )}
    </div>
  );
}
