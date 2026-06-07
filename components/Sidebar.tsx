import React from 'react';
import {
  LayoutDashboard, Building2, Receipt, TrendingUp, HandCoins,
  PiggyBank, Briefcase, List, Settings, DollarSign,
} from 'lucide-react';
import { PageName } from '../types';

const NAV = [
  { page: 'dashboard' as PageName, label: 'Dashboard', icon: LayoutDashboard },
  { page: 'bank' as PageName, label: 'Bank', icon: Building2 },
  { page: 'expenses' as PageName, label: 'Expenses', icon: Receipt },
  { page: 'income' as PageName, label: 'Income', icon: TrendingUp },
  { page: 'loans' as PageName, label: 'Loans', icon: HandCoins },
  { page: 'savings' as PageName, label: 'Savings', icon: PiggyBank },
  { page: 'business' as PageName, label: 'Business', icon: Briefcase },
  { page: 'lists' as PageName, label: 'Lists', icon: List },
];

interface SidebarProps {
  current: PageName;
  onChange: (p: PageName) => void;
  currency: string;
}

export default function Sidebar({ current, onChange, currency }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{ width: 220, background: '#1a1d24', borderRight: '1px solid #2d3748', flexShrink: 0 }}
    >
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10b981' }}>
          <DollarSign size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">FinTrack</div>
          <div className="text-xs text-gray-500">Financial Manager</div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map(({ page, label, icon: Icon }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onChange(page)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all text-left"
              style={{
                background: active ? '#10b981' : 'transparent',
                color: active ? '#fff' : '#9ca3af',
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={() => onChange('settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: current === 'settings' ? '#10b981' : 'transparent',
            color: current === 'settings' ? '#fff' : '#9ca3af',
          }}
        >
          <Settings size={17} />
          Settings
        </button>
        <div className="mt-3 px-3 text-xs text-gray-600">Currency: {currency}</div>
      </div>
    </aside>
  );
}
