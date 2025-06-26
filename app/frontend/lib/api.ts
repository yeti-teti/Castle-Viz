import {
    User,
    Payment,
    Bill,
    LatestPayment,
    CardData,
    ExpenseTable,
    MonthlyExpense
} from "@/lib/definitions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8080";

class ApiService{

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });
    
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
    
        return response.json();
    }

    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users/');
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.request<User | null>(`/users/by-email/${email}`);
    }

    async createUser(userData: any): Promise<User> {
        return this.request<User>('/users/', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
    }

    async getPayments(currentUserId?: string): Promise<Payment[]> {
        const expenses = await this.getFilteredExpenses('', 1, 1000);
        return expenses.filter(expense => expense.status === 'paid').map(expense => ({
            id: expense.id,
            category: expense.category,
            vendor: expense.vendor,
            amount: expense.amount,
            created_at: expense.created_at
        }));
    }

    async getLatestPayments(): Promise<LatestPayment[]> {
        return this.request<LatestPayment[]>('/payments/latest');
    }

    async createPayment(paymentData: any): Promise<Payment> {
        return this.request<Payment>('/payments/', {
          method: 'POST',
          body: JSON.stringify(paymentData),
        });
    }

    async getBills(): Promise<Bill[]> {
        return this.request<Bill[]>('/bills/');
    }

    async createBill(billData: any): Promise<Bill> {
    return this.request<Bill>('/bills/', {
        method: 'POST',
        body: JSON.stringify(billData),
    });
    }

    async getCardData(): Promise<CardData> {
        return this.request<CardData>('/dashboard/card-data');
    }

    async getFilteredExpenses(query: string = '', page: number = 1, itemsPerPage: number = 6): Promise<ExpenseTable[]> {
        return this.request<ExpenseTable[]>(`/expenses/filtered?query=${encodeURIComponent(query)}&page=${page}&items_per_page=${itemsPerPage}`);
    }

    async getExpensesPages(query: string = '', itemsPerPage: number = 6): Promise<{total_pages: number}> {
        return this.request<{total_pages: number}>(`/expenses/pages?query=${encodeURIComponent(query)}&items_per_page=${itemsPerPage}`);
    }

    async getExpensesByMonth(): Promise<MonthlyExpense[]> {
        return this.request<MonthlyExpense[]>('/expenses/by-month');
    }

    async getAllPayments(): Promise<Payment[]> {
        try {
            const expenses = await this.getFilteredExpenses('', 1, 1000); 
            return expenses.filter(expense => expense.status === 'paid').map(expense => ({
                id: expense.id,
                category: expense.category,
                vendor: expense.vendor,
                amount: expense.amount,
                created_at: expense.created_at
            }));
        } catch (error) {
            console.error("Error fetching all payments:", error);
            return [];
        }
    }

    async getAllBills(): Promise<Bill[]> {
        try {
            const expenses = await this.getFilteredExpenses('', 1, 1000); 
            return expenses.filter(expense => expense.status === 'pending').map(expense => ({
                id: expense.id,
                category: expense.category,
                vendor: expense.vendor,
                amount: expense.amount,
                status: expense.status as 'pending' | 'paid',
                created_at: expense.created_at
            }));
        } catch (error) {
            console.error("Error fetching all bills:", error);
            
            return this.getBills();
        }
    }

    async getVendors(): Promise<string[]> {
        return this.request<string[]>('/vendors/');
    }

    async getCategories(): Promise<string[]> {
        return this.request<string[]>('/categories/');
    }

    async updateBill(billId: string, billData: any): Promise<Bill> {
        return this.request<Bill>(`/bills/${billId}`, {
            method: 'PUT',
            body: JSON.stringify(billData),
        });
    }
    
    async deleteBill(billId: string): Promise<{message: string}> {
        return this.request<{message: string}>(`/bills/${billId}`, {
            method: 'DELETE',
        });
    }
    
    async updatePayment(paymentId: string, paymentData: any): Promise<Payment> {
        return this.request<Payment>(`/payments/${paymentId}`, {
            method: 'PUT',
            body: JSON.stringify(paymentData),
        });
    }
    
    async deletePayment(paymentId: string): Promise<{message: string}> {
        return this.request<{message: string}>(`/payments/${paymentId}`, {
            method: 'DELETE',
        });
    }
    
    async getBillById(billId: string): Promise<Bill> {
        return this.request<Bill>(`/bills/${billId}`);
    }
    
    async getPaymentById(paymentId: string): Promise<Payment> {
        return this.request<Payment>(`/payments/${paymentId}`);
    }

    async fetchItemById(id: string): Promise<any> {
        try {
            return await this.getBillById(id);
        } catch (billError) {
            try {
                const payment = await this.getPaymentById(id);
                return {
                    ...payment,
                    status: 'paid'
                };
            } catch (paymentError) {
                throw new Error(`Item with ID ${id} not found`);
            }
        }
    }
}

export const apiService = new ApiService();