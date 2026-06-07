import React, { useMemo } from 'react';
import { useData, getCurrentMonth, formatCurrency, getMonthKey, monthLabel } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, MessageCircle } from 'lucide-react';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function StatCard({ label, value, color = '#10b981', sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { bills, expenses, income, bankAccounts, loans, savings, businessEntries, settings } = useData();
  const sym = settings.currencySymbol;
  const cur = getCurrentMonth();
  const fmt = (n: number) => formatCurrency(n, sym);
  const today = new Date();

  const bankBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const monthlyIncome = income.filter(i => i.date.startsWith(cur)).reduce((s, i) => s + i.amount, 0);
  const monthlyBills = bills.reduce((s, b) => s + b.amount, 0);
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(cur)).reduce((s, e) => s + e.amount, 0);
  const totalMonthlyExpenses = monthlyBills + monthlyExpenses;
  const remaining = monthlyIncome - totalMonthlyExpenses;
  const iOwe = loans.filter(l => l.type === 'owe' && !l.paid).reduce((s, l) => s + l.amount, 0);
  const owedToMe = loans.filter(l => l.type === 'owed' && !l.paid).reduce((s, l) => s + l.amount, 0);
  const totalSaved = savings.reduce((s, sv) => s + sv.currentAmount, 0);
  const bizIncome = businessEntries.filter(e => e.type === 'income' && e.date.startsWith(cur)).reduce((s, e) => s + e.amount, 0);
  const bizExpenses = businessEntries.filter(e => e.type === 'expense' && e.date.startsWith(cur)).reduce((s, e) => s + e.amount, 0);
  const bizProfit = bizIncome - bizExpenses;
  const billsPaid = bills.filter(b => b.paidMonths.includes(cur)).length;
  const pctSpent = monthlyIncome > 0 ? Math.min((totalMonthlyExpenses / monthlyIncome) * 100, 100) : 0;

  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const mk = getMonthKey(i - 5);
    return {
      month: monthLabel(mk),
      income: income.filter(x => x.date.startsWith(mk)).reduce((s, x) => s + x.amount, 0),
      expenses: bills.reduce((s, b) => s + b.amount, 0) + expenses.filter(x => x.date.startsWith(mk)).reduce((s, x) => s + x.amount, 0),
    };
  }), [income, bills, expenses]);

  const pieData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.filter(e => e.date.startsWith(cur)).forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    bills.forEach(b => { cats[b.category] = (cats[b.category] || 0) + b.amount; });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses, bills, cur]);

  const billsDueSoon = useMemo(() => bills.filter(b => {
    if (b.paidMonths.includes(cur)) return false;
    const d = new Date(today.getFullYear(), today.getMonth(), b.dueDay);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    return diff <= 7;
  }).sort((a, b) => a.dueDay - b.dueDay), [bills, cur]);

  const sendWA = (bill: typeof bills[0]) => {
    if (!settings.whatsappNumber) { alert('Set your WhatsApp number in Settings first.'); return; }
    const due = new Date(today.getFullYear(), today.getMonth(), bill.dueDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const msg = `💰 Payment Reminder!\n\n${bill.name}\nAmount: ${fmt(bill.amount)}\nDue: ${due}\n\nDon't forget to pay on time! ✅`;
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your financial overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <StatCard label="Bank Balance" value={fmt(bankBalance)} color="#10b981" />
        <StatCard label="Monthly Income" value={fmt(monthlyIncome)} color="#10b981" />
        <StatCard label="Total Expenses" value={fmt(totalMonthlyExpenses)} color="#ef4444" />
        <StatCard label="Remaining" value={fmt(Math.abs(remaining))} color={remaining >= 0 ? '#10b981' : '#ef4444'} sub={remaining < 0 ? '⚠ Over budget' : undefined} />
        <StatCard label="Total Saved" value={fmt(totalSaved)} color="#3b82f6" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="I Owe" value={fmt(iOwe)} color="#f59e0b" />
        <StatCard label="Owed to Me" value={fmt(owedToMe)} color="#10b981" />
        <StatCard label="Biz Profit" value={fmt(Math.abs(bizProfit))} color={bizProfit >= 0 ? '#10b981' : '#ef4444'} />
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Bills This Month</div>
          <div className="text-xl font-bold text-white">{billsPaid} / {bills.length} paid</div>
          <div className="mt-2 h-1.5 rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${bills.length > 0 ? (billsPaid / bills.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {monthlyIncome > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 font-medium">Monthly Budget Usage</span>
            <span className={pctSpent > 90 ? 'text-red-400' : 'text-gray-400'}>{pctSpent.toFixed(1)}% spent</span>
          </div>
          <div className="h-3 rounded-full bg-gray-700">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctSpent}%`, background: pctSpent > 90 ? '#ef4444' : pctSpent > 70 ? '#f59e0b' : '#10b981' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Spent: {fmt(totalMonthlyExpenses)}</span>
            <span>Income: {fmt(monthlyIncome)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} width={55} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #374151', borderRadius: 8 }} labelStyle={{ color: '#9ca3af' }} formatter={(v: any) => [fmt(v)]} />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: any) => [fmt(v)]} />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[210px] text-gray-600 text-sm">No expense data this month</div>
          )}
        </div>
      </div>

      {billsDueSoon.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Bills Due Soon (within 7 days)</h3>
          </div>
          {billsDueSoon.map(bill => {
            const d = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
            const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
            return (
              <div key={bill.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #2d3748' }}>
                <div>
                  <span className="text-white text-sm font-medium">{bill.name}</span>
                  <span className="text-gray-500 text-xs ml-2 capitalize">{bill.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{fmt(bill.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${days <= 0 ? 'bg-red-500/20 text-red-400' : days <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {days <= 0 ? 'Overdue!' : `${days}d left`}
                  </span>
                  <button onClick={() => sendWA(bill)} title="Send WhatsApp reminder" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
