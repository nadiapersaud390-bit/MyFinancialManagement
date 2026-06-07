import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bill, Expense, IncomeEntry, BankAccount, Transaction, Loan, Saving, BusinessEntry, MyList, AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'GYD',
  currencySymbol: '$',
  whatsappNumber: '',
  monthlyBudget: 0,
};

interface DataContextType {
  bills: Bill[];
  expenses: Expense[];
  income: IncomeEntry[];
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  loans: Loan[];
  savings: Saving[];
  businessEntries: BusinessEntry[];
  lists: MyList[];
  settings: AppSettings;
  loading: boolean;

  addBill: (b: Omit<Bill, 'id' | 'createdAt'>) => Promise<void>;
  updateBill: (id: string, b: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaid: (id: string, month: string) => Promise<void>;

  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addIncome: (i: Omit<IncomeEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateIncome: (id: string, i: Partial<IncomeEntry>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addBankAccount: (a: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  updateBankAccount: (id: string, a: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addLoan: (l: Omit<Loan, 'id' | 'createdAt'>) => Promise<void>;
  updateLoan: (id: string, l: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  addSaving: (s: Omit<Saving, 'id' | 'createdAt'>) => Promise<void>;
  updateSaving: (id: string, s: Partial<Saving>) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;

  addBusinessEntry: (e: Omit<BusinessEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateBusinessEntry: (id: string, e: Partial<BusinessEntry>) => Promise<void>;
  deleteBusinessEntry: (id: string) => Promise<void>;

  addList: (l: Omit<MyList, 'id' | 'createdAt'>) => Promise<void>;
  updateList: (id: string, l: Partial<MyList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function useCollection<T>(collectionName: string): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
    }, () => {
      const unsub2 = onSnapshot(collection(db, collectionName), (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
      });
      return unsub2;
    });
    return unsub;
  }, [collectionName]);
  return items;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const bills = useCollection<Bill>('bills');
  const expenses = useCollection<Expense>('expenses');
  const income = useCollection<IncomeEntry>('income');
  const bankAccounts = useCollection<BankAccount>('bankAccounts');
  const transactions = useCollection<Transaction>('transactions');
  const loans = useCollection<Loan>('loans');
  const savings = useCollection<Saving>('savings');
  const businessEntries = useCollection<BusinessEntry>('businessEntries');
  const lists = useCollection<MyList>('lists');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as AppSettings);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const coll = (name: string) => collection(db, name);
  const d = (name: string, id: string) => doc(db, name, id);
  const ts = () => ({ createdAt: serverTimestamp() });

  const addBill = async (b: Omit<Bill, 'id' | 'createdAt'>) => { await addDoc(coll('bills'), { ...b, ...ts() }); };
  const updateBill = async (id: string, b: Partial<Bill>) => { await updateDoc(d('bills', id), b); };
  const deleteBill = async (id: string) => { await deleteDoc(d('bills', id)); };
  const toggleBillPaid = async (id: string, month: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    const paidMonths = bill.paidMonths.includes(month)
      ? bill.paidMonths.filter((m) => m !== month)
      : [...bill.paidMonths, month];
    await updateDoc(d('bills', id), { paidMonths });
  };

  const addExpense = async (e: Omit<Expense, 'id' | 'createdAt'>) => { await addDoc(coll('expenses'), { ...e, ...ts() }); };
  const updateExpense = async (id: string, e: Partial<Expense>) => { await updateDoc(d('expenses', id), e); };
  const deleteExpense = async (id: string) => { await deleteDoc(d('expenses', id)); };

  const addIncome = async (i: Omit<IncomeEntry, 'id' | 'createdAt'>) => { await addDoc(coll('income'), { ...i, ...ts() }); };
  const updateIncome = async (id: string, i: Partial<IncomeEntry>) => { await updateDoc(d('income', id), i); };
  const deleteIncome = async (id: string) => { await deleteDoc(d('income', id)); };

  const addBankAccount = async (a: Omit<BankAccount, 'id' | 'createdAt'>) => { await addDoc(coll('bankAccounts'), { ...a, ...ts() }); };
  const updateBankAccount = async (id: string, a: Partial<BankAccount>) => { await updateDoc(d('bankAccounts', id), a); };
  const deleteBankAccount = async (id: string) => { await deleteDoc(d('bankAccounts', id)); };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'createdAt'>) => { await addDoc(coll('transactions'), { ...t, ...ts() }); };
  const updateTransaction = async (id: string, t: Partial<Transaction>) => { await updateDoc(d('transactions', id), t); };
  const deleteTransaction = async (id: string) => { await deleteDoc(d('transactions', id)); };

  const addLoan = async (l: Omit<Loan, 'id' | 'createdAt'>) => { await addDoc(coll('loans'), { ...l, ...ts() }); };
  const updateLoan = async (id: string, l: Partial<Loan>) => { await updateDoc(d('loans', id), l); };
  const deleteLoan = async (id: string) => { await deleteDoc(d('loans', id)); };

  const addSaving = async (s: Omit<Saving, 'id' | 'createdAt'>) => { await addDoc(coll('savings'), { ...s, ...ts() }); };
  const updateSaving = async (id: string, s: Partial<Saving>) => { await updateDoc(d('savings', id), s); };
  const deleteSaving = async (id: string) => { await deleteDoc(d('savings', id)); };

  const addBusinessEntry = async (e: Omit<BusinessEntry, 'id' | 'createdAt'>) => { await addDoc(coll('businessEntries'), { ...e, ...ts() }); };
  const updateBusinessEntry = async (id: string, e: Partial<BusinessEntry>) => { await updateDoc(d('businessEntries', id), e); };
  const deleteBusinessEntry = async (id: string) => { await deleteDoc(d('businessEntries', id)); };

  const addList = async (l: Omit<MyList, 'id' | 'createdAt'>) => { await addDoc(coll('lists'), { ...l, ...ts() }); };
  const updateList = async (id: string, l: Partial<MyList>) => { await updateDoc(d('lists', id), l); };
  const deleteList = async (id: string) => { await deleteDoc(d('lists', id)); };

  const updateSettings = async (s: Partial<AppSettings>) => {
    await setDoc(doc(db, 'settings', 'main'), { ...settings, ...s }, { merge: true });
  };

  return (
    <DataContext.Provider value={{
      bills, expenses, income, bankAccounts, transactions, loans, savings,
      businessEntries, lists, settings, loading,
      addBill, updateBill, deleteBill, toggleBillPaid,
      addExpense, updateExpense, deleteExpense,
      addIncome, updateIncome, deleteIncome,
      addBankAccount, updateBankAccount, deleteBankAccount,
      addTransaction, updateTransaction, deleteTransaction,
      addLoan, updateLoan, deleteLoan,
      addSaving, updateSaving, deleteSaving,
      addBusinessEntry, updateBusinessEntry, deleteBusinessEntry,
      addList, updateList, deleteList,
      updateSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getMonthKey(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}
