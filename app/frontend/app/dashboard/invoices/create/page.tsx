import Form from "@/components/ui/invoices/create-form";
import Breadcrumbs from "@/components/ui/invoices/breadcrumbs";
import { fetchVendors, fetchCategories } from "@/lib/actions";

export default async function Page() {
  const [vendors, categories] = await Promise.all([
    fetchVendors(),
    fetchCategories(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Expenses", href: "/dashboard/invoices" },
          {
            label: "Create Expense",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      <Form vendors={vendors} categories={categories} />
    </main>
  );
}