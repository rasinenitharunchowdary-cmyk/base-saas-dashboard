import type { PropsWithChildren } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BaseShell } from "../../components/base/base-shell";
import { decodeDemoAuthCookie, DEMO_AUTH_COOKIE } from "../../lib/demo-auth";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();

  const session = decodeDemoAuthCookie(cookieStore.get(DEMO_AUTH_COOKIE)?.value);

  if (!session) {
    redirect("/login");
  }

  return <BaseShell>{children}</BaseShell>;
}
