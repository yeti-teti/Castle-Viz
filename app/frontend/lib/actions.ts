"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VendorField, CategoryField, BillForm } from "@/lib/definitions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const BillFormSchema = z.object({
  id: z.string(),
  vendor: z.string().min(1, { message: "Please enter a vendor name." }),
  category: z.string().min(1, { message: "Please enter a category." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select a status.",
  }),
  user_id: z.string(),
});

const CreateBill = BillFormSchema.omit({ id: true });
const UpdateBill = BillFormSchema.omit({ id: true });

export type State = {
  errors?: {
    vendor?: string[];
    category?: string[];
    amount?: string[];
    status?: string[];
    user_id?: string[];
  };
  message?: string | null;
};

export async function createBill(prevState: State, formData: FormData) {
  const validatedFields = CreateBill.safeParse({
    vendor: formData.get("vendor"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    user_id: formData.get("user_id"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Bill.",
    };
  }

  const { vendor, category, amount, status, user_id } = validatedFields.data;
  const amountInCents = Math.round(amount * 100);

  try {
    const endpoint = status === 'paid' ? '/payments/' : '/bills/';
    const payload = {
      vendor,
      category,
      amount: amountInCents,
      user_id,
      ...(status === 'pending' && { status })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

  } catch (error) {
    console.error('API Error:', error);
    return {
      message: "API Error: Failed to Create Bill.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateBill(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateBill.safeParse({
    vendor: formData.get("vendor"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    user_id: formData.get("user_id"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Bill.",
    };
  }

  const { vendor, category, amount, status, user_id } = validatedFields.data;
  const amountInCents = Math.round(amount * 100);

  try {
    const endpoint = status === 'paid' ? `/payments/${id}` : `/bills/${id}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor,
        category,
        amount: amountInCents,
        status,
        user_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return { message: "API Error: Failed to Update Bill." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}


export async function fetchVendors(): Promise<VendorField[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Failed to fetch vendors:', response.status);
      return [];
    }

    const vendors: string[] = await response.json();
    
    return vendors.map((vendor, index) => ({
      id: index.toString(),
      name: vendor
    }));
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}


export async function fetchCategories(): Promise<CategoryField[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status);
      return [];
    }

    const categories: string[] = await response.json();
    
    return categories.map((category, index) => ({
      id: index.toString(),
      name: category
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function fetchBillById(id: string): Promise<BillForm | null> {
  try {
    // Try bills first
    let response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const bill = await response.json();
      return {
        id: bill.id,
        vendor: bill.vendor,
        category: bill.category,
        amount: bill.amount / 100, 
        status: bill.status,
        user_id: bill.user_id,
      };
    }

    response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const payment = await response.json();
      return {
        id: payment.id,
        vendor: payment.vendor,
        category: payment.category,
        amount: payment.amount / 100,
        status: 'paid' as const,
        user_id: payment.user_id,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch bill:', error);
    return null;
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Try to delete from bills first
    let response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If not found in bills, try payments
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

  } catch (error) {
    console.error('API Error:', error);
    throw new Error("Failed to delete expense.");
  }

  revalidatePath("/dashboard/invoices");
}