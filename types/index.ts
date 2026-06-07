export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  paidMonths: string[];
  notes: string;
  whatsappReminder: boolean;
  createdAt: any;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  createdAt: any;
}

export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  createdAt: any;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  currency: string;
  notes: string;
  createdAt: any;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  category: string;
  notes: string;
  createdAt: any;
}

export interface Loan {
  id: string;
  person: string;
  amount: number;
  type: 'owe' | 'owed';
  startDate: string;
  dueDate: string;
  paid: boolean;
  notes: string;
  createdAt: any;
}

export interface Saving {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  notes: string;
  createdAt: any;
}

export interface BusinessEntry {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  notes: string;
  createdAt: any;
}

export interface MyList {
  id: string;
  name: string;
  items: { id: string; text: string; checked: boolean }[];
  createdAt: any;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  whatsappNumber: string;
  monthlyBudget: number;
}

export type PageName =
  | 'dashboard'
  | 'bank'
  | 'expenses'
  | 'income'
  | 'loans'
  | 'savings'
  | 'business'
  | 'lists'
  | 'settings';
