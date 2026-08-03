import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthSessionProvider } from "../components/base/auth-session";
import { ToastProvider } from "../components/base/toast-provider";
import "./globals.css";
import "../components/base/customers-tasks.css";
import "../components/base/planning-product.css";
import "../components/base/invoices-messages.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: {
      default: "Base — SaaS Dashboard",
      template: "%s · Base",
    },
    description:
      "A responsive SaaS dashboard for product analytics, customers, invoices, tasks, scheduling, calendars, and team messaging.",
    applicationName: "Base",
    keywords: ["SaaS dashboard", "analytics", "customer operations", "project management"],
    icons: {
      icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
      shortcut: "/logo.svg",
    },
    openGraph: {
      title: "Base — SaaS Dashboard",
      description: "Manage products, customers, invoices, schedules, tasks, and messages from one clear workspace.",
      type: "website",
      siteName: "Base",
    },
    twitter: {
      card: "summary",
      title: "Base — SaaS Dashboard",
      description: "Manage products, customers, invoices, schedules, tasks, and messages from one clear workspace.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthSessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
