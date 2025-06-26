export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Payment = {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  created_at: string;
};

export type Bill = {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
};

export type LatestPayment = {
  id: string;
  vendor: string;
  category: string;
  amount: string;
};

export type LatestPaymentRaw = {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  created_at: string;
};

export type CardData = {
  totalPayments: string;
  pendingBills: string;
  totalBills: number;
  totalCategories: number;
}

export type ExpenseTable = {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export type MonthlyExpense = {
  month: string;
  revenue: number;
}

export type VendorField = {
  id: string;
  name: string;
}

export type CategoryField = {
  id: string;
  name: string;
}

export type BillForm = {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'pending' | 'paid';
  user_id: string;
}

export type BillCreate = {
  vendor: string;
  category: string;
  amount: number;
  status: 'pending' | 'paid';
  user_id: string;
}

export type PaymentCreate = {
  vendor: string;
  category: string;
  amount: number;
  user_id: string;
}