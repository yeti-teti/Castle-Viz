import { UpdateExpense, DeleteExpense } from "@/components/ui/invoices/buttons";
import InvoiceStatus from "@/components/ui/invoices/status";
import { formatDateToLocal, formatCurrency } from "@/lib/utils";
import { fetchFilteredExpenses } from "@/lib/new-data";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const expenses = await fetchFilteredExpenses(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {expenses?.map((expense) => (
              <div
                key={expense.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                          {expense.vendor.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p>{expense.vendor}</p>
                    </div>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <InvoiceStatus status={expense.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p>{formatDateToLocal(expense.created_at)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateExpense id={expense.id} />
                    <DeleteExpense id={expense.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Vendor
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {expenses?.map((expense) => (
                <tr
                  key={expense.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                          {expense.vendor.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p>{expense.vendor}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {expense.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(expense.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={expense.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateExpense id={expense.id} />
                      <DeleteExpense id={expense.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}