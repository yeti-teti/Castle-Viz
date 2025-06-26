import "@/app/global.css";
import { inter } from "@/components/ui/fonts";
import { Metadata } from "next";

import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const metadata: Metadata = {
  title: {
    template: "%s | Castle-Viz Dashboard",
    default: "Castle-Viz Dashboard",
  },
  description: "Castle-Viz - A powerful dashboard for visualizing and managing your data.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  );
}
