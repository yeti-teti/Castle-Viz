import { inter } from "@/components/ui/fonts";
import { apiService } from "./api";

export async function fetchLatestPayments() {
  try {
    const latestPayments = await apiService.getLatestPayments();
    return latestPayments;
  } catch (error) {
    console.error("API Error:", error);
    return []; 
  }
}

export async function fetchCardData() {
  try {
    const cardData = await apiService.getCardData();
    return cardData;
  } catch (error) {
    console.error("API Error:", error);
    
    return {
      totalPayments: "$0.00",
      pendingBills: "$0.00",
      totalBills: 0,
      totalCategories: 0
    };
  }
}

export type ExpenseTable = {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export async function fetchFilteredExpenses(
  query: string,
  currentPage: number,
) {
  try {
    const expenses = await apiService.getFilteredExpenses(query, currentPage, 6);
    return expenses;
  } catch (error) {
    console.error("API Error:", error);
    return []; 
  }
}

export async function fetchExpensesPages(query: string) {
  try {
    const result = await apiService.getExpensesPages(query, 6);
    return result.total_pages;
  } catch (error) {
    console.error("API Error:", error);
    return 1;
  }
}

export interface MonthlyExpense {
  month: string;
  revenue: number;
}

export async function fetchExpenses(): Promise<MonthlyExpense[]>{
  try{
    const expenses = await apiService.getExpensesByMonth();
    return expenses;
  } catch(error){
    console.error("API Error:", error);
    return [];
  }
}