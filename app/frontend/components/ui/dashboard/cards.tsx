import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { fetchCardData } from "@/lib/new-data";
import { lusitana } from "@/components/ui/fonts";

const iconMap = {
  paid: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    totalPayments,
    pendingBills,
    totalBills,
    totalCategories,
  } = await fetchCardData();

  return (
    <>
      <Card title="Total Payments" value={totalPayments} type="paid" />
      <Card title="Pending Bills" value={pendingBills} type="pending" />
      <Card title="Total Bills" value={totalBills} type="invoices" />
      <Card
        title="Total Categories"
        value={totalCategories}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "invoices" | "customers" | "pending" | "paid";
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
