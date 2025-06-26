import Pagination from "@/components/ui/invoices/pagination";
import Search from "@/components/ui/search";
import Table from "@/components/ui/invoices/table";
import { CreateExpense } from "@/components/ui/invoices/buttons";
import { lusitana } from "@/components/ui/fonts";
import { InvoicesTableSkeleton } from "@/components/ui/skeletons";
import { Suspense } from "react";
import { fetchExpensesPages } from "@/lib/new-data";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchExpensesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>All Expenses</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search expenses..." />
        <CreateExpense />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}