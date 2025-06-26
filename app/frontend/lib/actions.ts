"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VendorField, CategoryField, BillForm } from "@/lib/definitions";
import { apiService } from './api';


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
    const payload = {
      vendor,
      category,
      amount: amountInCents,
      user_id,
      ...(status === 'pending' && { status })
    };

    if (status === 'paid') {
      await apiService.createPayment(payload);
    } else {
      await apiService.createBill(payload);
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
    const payload = {
      vendor,
      category,
      amount: amountInCents,
      status,
      user_id,
    };

    if (status === 'paid') {
      await apiService.updatePayment(id, payload);
    } else {
      await apiService.updateBill(id, payload);
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
      const vendors = await apiService.getVendors();
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
      const categories = await apiService.getCategories();
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
    const item = await apiService.fetchItemById(id);
    return {
      id: item.id,
      vendor: item.vendor,
      category: item.category,
      amount: item.amount / 100,
      status: item.status,
      user_id: item.user_id,
    };
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
    // Try deleting as bill first, then as payment
    try {
      await apiService.deleteBill(id);
    } catch (billError) {
      await apiService.deletePayment(id);
    }
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    throw new Error('Failed to delete invoice');
  }

  revalidatePath("/dashboard/invoices");
}