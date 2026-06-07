import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, MessageCircle, X } from 'lucide-react';
import { useData, getCurrentMonth, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormSelect, FormTextarea, ActionButtons } from '../components/Modal';
import { Bill, Expense } from '../types';

const BILL_CATS = ['Rent', 'Utilities', 'Internet', 'Subscriptions', 'Insurance', 'Phone', 'Transport', 'Pets', 'Gym', 'Other'].map(v => ({ value: v.toLowerCase(), label: v }));
const EXP_CATS = ['Food', 'Shopping', 'Entertainment', 'Health', 'Transport', 'Education', 'Personal', 'Household', 'Travel', 'Other'].map(v => ({ value: v.toLowerCase(), label: v }));

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

type BillForm = { name: string; amount: string; dueDay: string; category: string; notes: string; whatsappReminder: boolean };
type ExpForm = { description: string; amount: string; date: string; category: string; notes: string };

const defBill: BillForm = { name: '', amount: '', dueDay: '1', category: 'rent', notes: '', whatsappReminder: false };
const defExp: ExpForm = { description: '', amount: '', date: new Date().toISOString().slice(0, 10), category: 'food', notes: '' };

export default function Expenses() {
  const { bills, expenses, addBill, updateBill, deleteBill, toggleBillPaid, addExpense, updateExpense, deleteExpense, settings } = useData();
  const sym = settings.currencySymbol;
  const cur = getCurrentMonth();
  const fmt = (n: number) => formatCurrency(n, sym);
  const today = new Date();

  const [billModal, setBillModal] = useState<Bill | null | 'new'>(null);
  const [expModal, setExpModal] = useState<Expense | null | 'new'>(null);
  const [billForm, setBillForm] = useState<BillForm>(defBill);
  const [expForm, setExpForm] = useState<ExpForm>(defExp);
  const [monthFilter, setMonthFilter] = useState(cur);

  const openBill = (bill?: Bill) => {
    setBillForm(bill ? { name: bill.name, amount: String(bill.amount), dueDay: String(bill.dueDay), category: bill.category, notes: bill.notes || '', whatsappReminder: bill.whatsappReminder } : defBill);
    setBillModal(bill ?? 'new');
  };
  const openExp = (exp?: Expense) => {
    setExpForm(exp ? { description: exp.description, amount: String(exp.amount), date: exp.date, category: exp.category, notes: exp.notes || '' } : defExp);
    setExpModal(exp ?? 'new');
  };

  const saveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: billForm.name, amount: parseFloat(billForm.amount) || 0, dueDay: parseInt(billForm.dueDay) || 1, category: billForm.category, notes: billForm.notes, whatsappReminder: billForm.whatsappReminder, paidMonths: billModal !== 'new' ? (billModal as Bill).paidMonths : [] };
    if (billModal === 'new') await addBill(data);
    else await updateBill((billModal as Bill).id, data);
    setBillModal(null);
  };

  const saveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { description: expForm.description, amount: parseFloat(expForm.amount) || 0, date: expForm.date, category: expForm.category, notes: expForm.notes };
    if (expModal === 'new') await addExpense(data);
    else await updateExpense((expModal as Expense).id, data);
    setExpModal(null);
  };

  const sendWA = (bill: Bill) => {
    if (!settings.whatsappNumber) { alert('Set your WhatsApp number in Settings first.'); return; }
    const due = new Date(today.getFullYear(), today.getMonth(), bill.dueDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const msg = `💰 Payment Reminder!\n\n*${bill.name}*\nAmount: ${fmt(bill.amount)}\nDue: ${due}\n\nDon't forget to pay on time! ✅`;
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredExp = expenses.filter(e => e.date.startsWith(monthFilter));
  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const paidBills = bills.filter(b => b.paidMonths.includes(cur)).reduce((s, b) => s + b.amount, 0);
  const unpaidBills = totalBills - paidBills;
  const totalExp = filteredExp.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 max-w-[1100px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Expenses</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your bills and spending</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bills/Month', value: fmt(totalBills), color: '#ef4444' },
          { label: 'Bills Paid', value: fmt(paidBills), color: '#10b981' },
          { label: 'Bills Unpaid', value: fmt(unpaidBills), color: '#f59e0b' },
          { label: 'Other Expenses', value: fmt(totalExp), color: '#ef4444' },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className="text-lg font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly Bills */}
      <div className="rounded-xl mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <h2 className="font-semibold text-white">Monthly Bills (Recurring)</h2>
          <button onClick={() => openBill()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
            <Plus size={15} /> Add Bill
          </button>
        </div>
        {bills.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">No bills yet. Add your first bill!</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {bills.sort((a, b) => a.dueDay - b.dueDay).map(bill => {
              const paid = bill.paidMonths.includes(cur);
              const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
              const overdue = !paid && dueDate < today;
              return (
                <div key={bill.id} className="flex items-center gap-3 px-5 py-3.5">
                  <button onClick={() => toggleBillPaid(bill.id, cur)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ borderColor: paid ? '#10b981' : '#374151', background: paid ? '#10b981' : 'transparent' }}>
                    {paid && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${paid ? 'text-gray-500 line-through' : 'text-white'}`}>{bill.name}</span>
                      {overdue && <span className="text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Overdue</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Due {ordinal(bill.dueDay)} · <span className="capitalize">{bill.category}</span>
                      {bill.notes && ` · ${bill.notes}`}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${paid ? 'text-gray-600' : 'text-white'}`}>{fmt(bill.amount)}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => sendWA(bill)} className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors" title="WhatsApp Reminder">
                      <MessageCircle size={15} />
                    </button>
                    <button onClick={() => openBill(bill)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteBill(bill.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* One-time Expenses */}
      <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <h2 className="font-semibold text-white">One-time Expenses</h2>
          <div className="flex items-center gap-2">
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              className="bg-gray-800 text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500" />
            <button onClick={() => openExp()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
              <Plus size={15} /> Add
            </button>
          </div>
        </div>
        {filteredExp.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">No expenses for this month.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredExp.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{exp.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5"><span className="capitalize">{exp.category}</span> · {new Date(exp.date + 'T00:00:00').toLocaleDateString()}</div>
                </div>
                <span className="text-sm font-bold text-red-400">{fmt(exp.amount)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openExp(exp)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => deleteExpense(exp.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between px-5 py-3 text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-red-400">{fmt(totalExp)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {billModal !== null && (
        <Modal title={billModal === 'new' ? 'Add Bill' : 'Edit Bill'} onClose={() => setBillModal(null)}>
          <form onSubmit={saveBill}>
            <FormInput label="Bill Name *" value={billForm.name} onChange={e => setBillForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Rent, Netflix" />
            <FormInput label="Amount *" type="number" step="0.01" value={billForm.amount} onChange={e => setBillForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <FormInput label="Due Day of Month *" type="number" min="1" max="31" value={billForm.dueDay} onChange={e => setBillForm(p => ({ ...p, dueDay: e.target.value }))} required />
            <FormSelect label="Category" value={billForm.category} onChange={e => setBillForm(p => ({ ...p, category: e.target.value }))} options={BILL_CATS} />
            <FormTextarea label="Notes" value={billForm.notes} onChange={e => setBillForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-4 cursor-pointer">
              <input type="checkbox" checked={billForm.whatsappReminder} onChange={e => setBillForm(p => ({ ...p, whatsappReminder: e.target.checked }))} className="w-4 h-4" />
              Enable WhatsApp reminders for this bill
            </label>
            <ActionButtons onCancel={() => setBillModal(null)} onDelete={billModal !== 'new' ? () => { deleteBill((billModal as Bill).id); setBillModal(null); } : undefined} />
          </form>
        </Modal>
      )}

      {/* Expense Modal */}
      {expModal !== null && (
        <Modal title={expModal === 'new' ? 'Add Expense' : 'Edit Expense'} onClose={() => setExpModal(null)}>
          <form onSubmit={saveExp}>
            <FormInput label="Description *" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} required placeholder="What did you spend on?" />
            <FormInput label="Amount *" type="number" step="0.01" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <FormInput label="Date *" type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} required />
            <FormSelect label="Category" value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} options={EXP_CATS} />
            <FormTextarea label="Notes" value={expForm.notes} onChange={e => setExpForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <ActionButtons onCancel={() => setExpModal(null)} onDelete={expModal !== 'new' ? () => { deleteExpense((expModal as Expense).id); setExpModal(null); } : undefined} />
          </form>
        </Modal>
      )}
    </div>
  );
}
