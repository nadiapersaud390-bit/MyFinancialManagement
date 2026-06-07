import React, { useState } from 'react';
import { Plus, Edit2, Trash2, PiggyBank } from 'lucide-react';
import { useData, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormTextarea, ActionButtons, Field } from '../components/Modal';
import { Saving } from '../types';

type Form = { name: string; goalAmount: string; currentAmount: string; deadline: string; notes: string };
const defForm: Form = { name: '', goalAmount: '', currentAmount: '0', deadline: '', notes: '' };

export default function Savings() {
  const { savings, addSaving, updateSaving, deleteSaving, settings } = useData();
  const sym = settings.currencySymbol;
  const fmt = (n: number) => formatCurrency(n, sym);

  const [modal, setModal] = useState<Saving | 'new' | null>(null);
  const [depositModal, setDepositModal] = useState<Saving | null>(null);
  const [form, setForm] = useState<Form>(defForm);
  const [depositAmt, setDepositAmt] = useState('');

  const open = (item?: Saving) => {
    setForm(item ? { name: item.name, goalAmount: String(item.goalAmount), currentAmount: String(item.currentAmount), deadline: item.deadline || '', notes: item.notes || '' } : defForm);
    setModal(item ?? 'new');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, goalAmount: parseFloat(form.goalAmount) || 0, currentAmount: parseFloat(form.currentAmount) || 0, deadline: form.deadline, notes: form.notes };
    if (modal === 'new') await addSaving(data);
    else await updateSaving((modal as Saving).id, data);
    setModal(null);
  };

  const addDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModal) return;
    const amount = parseFloat(depositAmt) || 0;
    await updateSaving(depositModal.id, { currentAmount: depositModal.currentAmount + amount });
    setDepositModal(null);
    setDepositAmt('');
  };

  const totalGoal = savings.reduce((s, sv) => s + sv.goalAmount, 0);
  const totalSaved = savings.reduce((s, sv) => s + sv.currentAmount, 0);

  return (
    <div className="p-6 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Savings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your savings goals</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Total Saved</div>
          <div className="text-xl font-bold text-emerald-400">{fmt(totalSaved)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Total Goal</div>
          <div className="text-xl font-bold text-white">{fmt(totalGoal)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-1">Overall Progress</div>
          <div className="text-xl font-bold text-blue-400">{totalGoal > 0 ? ((totalSaved / totalGoal) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => open()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
          <Plus size={15} /> New Savings Goal
        </button>
      </div>

      {savings.length === 0 ? (
        <div className="rounded-xl flex items-center justify-center py-20" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-center text-gray-600">
            <PiggyBank size={32} className="mx-auto mb-3" />
            <p className="text-sm">No savings goals yet. Create your first one!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savings.map(sv => {
            const pct = sv.goalAmount > 0 ? Math.min((sv.currentAmount / sv.goalAmount) * 100, 100) : 0;
            const remaining = sv.goalAmount - sv.currentAmount;
            const done = sv.currentAmount >= sv.goalAmount;
            const daysLeft = sv.deadline ? Math.ceil((new Date(sv.deadline).getTime() - Date.now()) / 86400000) : null;
            return (
              <div key={sv.id} className="rounded-xl p-5" style={{ background: '#1a1d24', border: `1px solid ${done ? '#10b98140' : '#2d3748'}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{sv.name}</h3>
                    {sv.notes && <p className="text-xs text-gray-500 mt-0.5">{sv.notes}</p>}
                    {sv.deadline && (
                      <p className="text-xs mt-0.5" style={{ color: daysLeft !== null && daysLeft < 30 ? '#f59e0b' : '#6b7280' }}>
                        Deadline: {new Date(sv.deadline + 'T00:00:00').toLocaleDateString()}
                        {daysLeft !== null && ` (${daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'})`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setDepositModal(sv); setDepositAmt(''); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: '#3b82f6' }}>
                      + Deposit
                    </button>
                    <button onClick={() => open(sv)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => deleteSaving(sv.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-emerald-400 font-semibold">{fmt(sv.currentAmount)}</span>
                    <span className="text-gray-500">Goal: {fmt(sv.goalAmount)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-700">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: done ? '#10b981' : '#3b82f6' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{pct.toFixed(1)}% complete</span>
                    <span>{done ? '✅ Goal reached!' : `${fmt(remaining)} remaining`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <Modal title={modal === 'new' ? 'New Savings Goal' : 'Edit Savings Goal'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <FormInput label="Goal Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Emergency Fund, New Car" />
            <FormInput label="Goal Amount *" type="number" step="0.01" value={form.goalAmount} onChange={e => setForm(p => ({ ...p, goalAmount: e.target.value }))} required placeholder="0.00" />
            <FormInput label="Current Amount" type="number" step="0.01" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} placeholder="0.00" />
            <FormInput label="Target Date (optional)" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            <FormTextarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="What are you saving for?" />
            <ActionButtons onCancel={() => setModal(null)} onDelete={modal !== 'new' ? () => { deleteSaving((modal as Saving).id); setModal(null); } : undefined} />
          </form>
        </Modal>
      )}

      {depositModal !== null && (
        <Modal title={`Deposit to "${depositModal.name}"`} onClose={() => setDepositModal(null)}>
          <form onSubmit={addDeposit}>
            <div className="mb-4 p-3 rounded-lg" style={{ background: '#0f1117' }}>
              <div className="text-xs text-gray-500 mb-1">Current Balance</div>
              <div className="text-xl font-bold text-emerald-400">{fmt(depositModal.currentAmount)}</div>
            </div>
            <FormInput label="Deposit Amount *" type="number" step="0.01" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} required placeholder="0.00" autoFocus />
            <ActionButtons onCancel={() => setDepositModal(null)} submitLabel="Add Deposit" />
          </form>
        </Modal>
      )}
    </div>
  );
}
