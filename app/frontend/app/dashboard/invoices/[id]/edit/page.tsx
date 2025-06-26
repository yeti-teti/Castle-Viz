import Form from "@/components/ui/invoices/edit-form";
import Breadcrumbs from "@/components/ui/invoices/breadcrumbs";
import { fetchBillById, fetchVendors, fetchCategories } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Expense",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  const [bill, vendors, categories] = await Promise.all([
    fetchBillById(id),
    fetchVendors(),
    fetchCategories(),
  ]);

  if (!bill) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Expenses", href: "/dashboard/invoices" },
          {
            label: "Edit Expense",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form bill={bill} vendors={vendors} categories={categories} />
    </main>
  );
}