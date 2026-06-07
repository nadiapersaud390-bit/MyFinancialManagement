import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Building2 } from 'lucide-react';
import { useData, formatCurrency } from '../context/DataContext';
import Modal, { FormInput, FormSelect, FormTextarea, ActionButtons } from '../components/Modal';
import { BankAccount, Transaction } from '../types';

const CURRENCIES = ['GYD', 'USD', 'EUR', 'GBP', 'CAD', 'TTD', 'JMD', 'BDS'].map(v => ({ value: v, label: v }));
const TX_CATS = ['Salary', 'Transfer', 'Bills', 'Food', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Other'].map(v => ({ value: v.toLowerCase(), label: v }));

type AccForm = { name: string; bank: string; balance: string; currency: string; notes: string };
type TxForm = { description: string; amount: string; type: 'credit' | 'debit'; date: string; category: string; notes: string };
const defAcc: AccForm = { name: '', bank: '', balance: '', currency: 'GYD', notes: '' };
const defTx: TxForm = { description: '', amount: '', type: 'credit', date: new Date().toISOString().slice(0, 10), category: 'salary', notes: '' };

export default function Bank() {
  const { bankAccounts, transactions, addBankAccount, updateBankAccount, deleteBankAccount, addTransaction, updateTransaction, deleteTransaction, settings } = useData();
  const sym = settings.currencySymbol;
  const fmt = (n: number) => formatCurrency(n, sym);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [accModal, setAccModal] = useState<BankAccount | 'new' | null>(null);
  const [txModal, setTxModal] = useState<Transaction | 'new' | null>(null);
  const [accForm, setAccForm] = useState<AccForm>(defAcc);
  const [txForm, setTxForm] = useState<TxForm>(defTx);

  const selected = bankAccounts.find(a => a.id === selectedId) || bankAccounts[0] || null;

  const openAcc = (a?: BankAccount) => {
    setAccForm(a ? { name: a.name, bank: a.bank, balance: String(a.balance), currency: a.currency, notes: a.notes || '' } : defAcc);
    setAccModal(a ?? 'new');
  };
  const openTx = (t?: Transaction) => {
    setTxForm(t ? { description: t.description, amount: String(t.amount), type: t.type, date: t.date, category: t.category, notes: t.notes || '' } : { ...defTx, date: new Date().toISOString().slice(0, 10) });
    setTxModal(t ?? 'new');
  };

  const saveAcc = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: accForm.name, bank: accForm.bank, balance: parseFloat(accForm.balance) || 0, currency: accForm.currency, notes: accForm.notes };
    if (accModal === 'new') await addBankAccount(data);
    else await updateBankAccount((accModal as BankAccount).id, data);
    setAccModal(null);
  };

  const saveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const data = { accountId: selected.id, description: txForm.description, amount: parseFloat(txForm.amount) || 0, type: txForm.type, date: txForm.date, category: txForm.category, notes: txForm.notes };
    if (txModal === 'new') await addTransaction(data);
    else await updateTransaction((txModal as Transaction).id, data);
    setTxModal(null);
  };

  const acctTxs = transactions.filter(t => t.accountId === selected?.id).sort((a, b) => b.date.localeCompare(a.date));
  const totalBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="p-6 max-w-[1100px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Bank</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your bank accounts and transactions</p>
      </div>

      {/* Total Balance */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="text-xs text-gray-500 mb-1">Total Bank Balance</div>
        <div className="text-3xl font-bold text-emerald-400">{fmt(totalBalance)}</div>
        <div className="text-xs text-gray-500 mt-1">{bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-1">
          <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2d3748' }}>
              <h2 className="font-semibold text-white text-sm">Accounts</h2>
              <button onClick={() => openAcc()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: '#10b981' }}>
                <Plus size={13} /> Add
              </button>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">No accounts yet.</div>
            ) : (
              <div className="p-2">
                {bankAccounts.map(acc => (
                  <div key={acc.id}
                    onClick={() => setSelectedId(acc.id)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1"
                    style={{ background: selected?.id === acc.id ? '#10b981' + '20' : 'transparent', border: `1px solid ${selected?.id === acc.id ? '#10b981' + '40' : 'transparent'}` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2d3748' }}>
                      <Building2 size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{acc.name}</div>
                      <div className="text-xs text-gray-500">{acc.bank}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{fmt(acc.balance)}</div>
                      <div className="text-xs text-gray-500">{acc.currency}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
                <div>
                  <h2 className="font-semibold text-white">{selected.name}</h2>
                  <div className="text-xs text-gray-500">{selected.bank}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openAcc(selected)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => { deleteBankAccount(selected.id); setSelectedId(null); }} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  <button onClick={() => openTx()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
                    <Plus size={15} /> Add Transaction
                  </button>
                </div>
              </div>

              {acctTxs.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-sm">No transactions yet.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {acctTxs.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tx.type === 'credit' ? '#10b98120' : '#ef444420' }}>
                        {tx.type === 'credit' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownLeft size={16} className="text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{tx.description}</div>
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">{tx.category} · {new Date(tx.date + 'T00:00:00').toLocaleDateString()}</div>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openTx(tx)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center py-20" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
              <div className="text-center text-gray-600">
                <Building2 size={32} className="mx-auto mb-3" />
                <p className="text-sm">Select or add an account</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {accModal !== null && (
        <Modal title={accModal === 'new' ? 'Add Bank Account' : 'Edit Account'} onClose={() => setAccModal(null)}>
          <form onSubmit={saveAcc}>
            <FormInput label="Account Name *" value={accForm.name} onChange={e => setAccForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Main Checking, Savings" />
            <FormInput label="Bank Name *" value={accForm.bank} onChange={e => setAccForm(p => ({ ...p, bank: e.target.value }))} required placeholder="e.g. Republic Bank" />
            <FormInput label="Current Balance *" type="number" step="0.01" value={accForm.balance} onChange={e => setAccForm(p => ({ ...p, balance: e.target.value }))} required placeholder="0.00" />
            <FormSelect label="Currency" value={accForm.currency} onChange={e => setAccForm(p => ({ ...p, currency: e.target.value }))} options={CURRENCIES} />
            <FormTextarea label="Notes" value={accForm.notes} onChange={e => setAccForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <ActionButtons onCancel={() => setAccModal(null)} onDelete={accModal !== 'new' ? () => { deleteBankAccount((accModal as BankAccount).id); setAccModal(null); setSelectedId(null); } : undefined} />
          </form>
        </Modal>
      )}

      {txModal !== null && (
        <Modal title={txModal === 'new' ? 'Add Transaction' : 'Edit Transaction'} onClose={() => setTxModal(null)}>
          <form onSubmit={saveTx}>
            <FormInput label="Description *" value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))} required placeholder="What was this transaction for?" />
            <FormInput label="Amount *" type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" />
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <div className="flex gap-3">
                {(['credit', 'debit'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setTxForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: txForm.type === t ? (t === 'credit' ? '#10b981' : '#ef4444') : '#2d3748', color: txForm.type === t ? '#fff' : '#9ca3af' }}>
                    {t === 'credit' ? '↑ Credit (In)' : '↓ Debit (Out)'}
                  </button>
                ))}
              </div>
            </div>
            <FormInput label="Date *" type="date" value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))} required />
            <FormSelect label="Category" value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))} options={TX_CATS} />
            <FormTextarea label="Notes" value={txForm.notes} onChange={e => setTxForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            <ActionButtons onCancel={() => setTxModal(null)} onDelete={txModal !== 'new' ? () => { deleteTransaction((txModal as Transaction).id); setTxModal(null); } : undefined} />
          </form>
        </Modal>
      )}
    </div>
  );
}
