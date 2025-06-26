import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SideNav from "@/components/ui/dashboard/sidenav";

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64 sidebar-bg border-r border-gray-200">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12"><NuqsAdapter>{children}</NuqsAdapter></div>
    </div>
  );
}