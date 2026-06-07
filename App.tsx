import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bank from './pages/Bank';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Loans from './pages/Loans';
import Savings from './pages/Savings';
import Business from './pages/Business';
import Lists from './pages/Lists';
import Settings from './pages/Settings';
import { PageName } from './types';

function AppInner() {
  const [page, setPage] = useState<PageName>('dashboard');
  const { settings, loading } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0f1117' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading FinTrack...</p>
        </div>
      </div>
    );
  }

  const pages: Record<PageName, React.ReactNode> = {
    dashboard: <Dashboard />,
    bank: <Bank />,
    expenses: <Expenses />,
    income: <Income />,
    loans: <Loans />,
    savings: <Savings />,
    business: <Business />,
    lists: <Lists />,
    settings: <Settings />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      <Sidebar current={page} onChange={setPage} currency={settings.currency} />
      <main className="flex-1 overflow-y-auto">
        {pages[page]}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
