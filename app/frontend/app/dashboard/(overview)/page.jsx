import RevenueChart from "@/components/ui/dashboard/revenue-chart";
import LatestPayments from "@/components/ui/dashboard/latest-payments"; // Changed import
import { lusitana } from "@/components/ui/fonts";
import CardWrapper from "@/components/ui/dashboard/cards";
import { Suspense } from "react";
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from "@/components/ui/skeletons";

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestPayments />
        </Suspense>
      </div>
    </main>
  );
}