import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, MessageCircle, DollarSign, Bell, Save } from 'lucide-react';
import { useData, formatCurrency } from '../context/DataContext';

const CURRENCIES = [
  { value: 'GYD', symbol: '$', label: 'GYD – Guyanese Dollar' },
  { value: 'USD', symbol: '$', label: 'USD – US Dollar' },
  { value: 'EUR', symbol: '€', label: 'EUR – Euro' },
  { value: 'GBP', symbol: '£', label: 'GBP – British Pound' },
  { value: 'CAD', symbol: '$', label: 'CAD – Canadian Dollar' },
  { value: 'TTD', symbol: '$', label: 'TTD – Trinidad Dollar' },
  { value: 'JMD', symbol: '$', label: 'JMD – Jamaican Dollar' },
  { value: 'BDS', symbol: '$', label: 'BDS – Barbados Dollar' },
];

export default function Settings() {
  const { settings, updateSettings, bills } = useData();
  const [currency, setCurrency] = useState(settings.currency);
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);
  const [budget, setBudget] = useState(String(settings.monthlyBudget));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCurrency(settings.currency);
    setWhatsapp(settings.whatsappNumber);
    setBudget(String(settings.monthlyBudget));
  }, [settings]);

  const save = async () => {
    const currencyObj = CURRENCIES.find(c => c.value === currency);
    await updateSettings({
      currency,
      currencySymbol: currencyObj?.symbol || '$',
      whatsappNumber: whatsapp,
      monthlyBudget: parseFloat(budget) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testWA = () => {
    if (!whatsapp) { alert('Enter your WhatsApp number first.'); return; }
    const msg = `👋 Hello from FinTrack!\n\nThis is a test reminder message.\n\nYour financial tracker is set up correctly! 💰✅`;
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const billsWithWA = bills.filter(b => b.whatsappReminder).length;

  return (
    <div className="p-6 max-w-[700px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure your FinTrack preferences</p>
      </div>

      {/* Currency */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-emerald-400" />
          <h2 className="font-semibold text-white">Currency</h2>
        </div>
        <label className="block text-sm text-gray-400 mb-2">Default Currency</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ background: '#0f1117', border: '1px solid #374151' }}>
          {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Monthly Budget */}
      <div className="rounded-xl p-5 mb-4" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={18} className="text-blue-400" />
          <h2 className="font-semibold text-white">Monthly Budget</h2>
        </div>
        <label className="block text-sm text-gray-400 mb-2">Set your monthly spending limit</label>
        <input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ background: '#0f1117', border: '1px solid #374151' }} />
        <p className="text-xs text-gray-600 mt-2">Used to calculate your remaining budget on the dashboard</p>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={18} className="text-emerald-400" />
          <h2 className="font-semibold text-white">WhatsApp Reminders</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Get WhatsApp reminders for your bills. Click the <MessageCircle size={13} className="inline" /> icon on any bill to send a reminder to yourself.
        </p>

        <label className="block text-sm text-gray-400 mb-2">Your WhatsApp Number (with country code)</label>
        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
          placeholder="e.g. +15921234567 or 15921234567"
          className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
          style={{ background: '#0f1117', border: '1px solid #374151' }} />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {billsWithWA > 0 ? `${billsWithWA} bill${billsWithWA !== 1 ? 's' : ''} have WhatsApp reminders enabled` : 'Enable WhatsApp reminders per bill in Expenses'}
          </p>
          <button onClick={testWA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: '#25D366' }}>
            <MessageCircle size={14} /> Test WhatsApp
          </button>
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{ background: '#0f1117', border: '1px solid #374151' }}>
          <div className="flex items-start gap-2">
            <Bell size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-yellow-400 mb-1">How reminders work</p>
              <p className="text-xs text-gray-500">
                Clicking the WhatsApp button on a bill opens WhatsApp with a pre-filled reminder message.
                You can send it to yourself or anyone else. Set your number above so it auto-fills the recipient.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={save}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all"
        style={{ background: saved ? '#059669' : '#10b981' }}>
        <Save size={18} />
        {saved ? '✓ Settings Saved!' : 'Save Settings'}
      </button>

      <div className="mt-6 p-4 rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <h3 className="text-sm font-semibold text-white mb-3">About FinTrack</h3>
        <div className="space-y-1.5 text-xs text-gray-500">
          <p>• All data is saved to Firebase in real time</p>
          <p>• Bills are recurring monthly — mark them as paid each month</p>
          <p>• WhatsApp reminders open WhatsApp with a pre-filled message</p>
          <p>• Bank balance is manually updated — use transactions as a log</p>
          <p>• Remaining budget = Monthly income − bills − one-time expenses</p>
        </div>
      </div>
    </div>
  );
}
