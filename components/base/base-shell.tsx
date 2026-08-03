"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  X,
} from "lucide-react";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { useAuthSession } from "./auth-session";
import { ScrollToTop } from "./scroll-to-top";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

export const baseNavigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3, aliases: ["/customers"] },
  { label: "Invoice", href: "/invoices", icon: FileText },
  { label: "Schedule", href: "/schedule", icon: ListTodo, aliases: ["/tasks"] },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Messages", href: "/messages", icon: MessageSquareText, badge: "49" },
  { label: "Notification", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function BaseLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="base-logo" aria-label="Base dashboard home">
      <span className="base-logo-mark" aria-hidden="true">
        <Image className="base-logo-image" src="/logo.svg" alt="" width={96} height={96} loading="eager" unoptimized />
      </span>
      {!compact && <strong>Base</strong>}
    </Link>
  );
}

export function BaseAvatar({
  src,
  name,
  size = "medium",
}: {
  src: string;
  name: string;
  size?: "small" | "medium" | "large";
}) {
  return <Image className={`base-avatar base-avatar-${size}`} src={src} alt={name} width={48} height={48} unoptimized />;
}

export function BaseShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthSession();
  const { showToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user?.name ?? "Easin Arafat";
  const displayEmail = user?.email ?? "easin.arafat@base.com";

  useOverlayScrollLock(mobileOpen, () => setMobileOpen(false));

  function handleSignOut() {
    signOut();
    setMobileOpen(false);
    showToast("You have been logged out safely.", { tone: "info", title: "Signed out" });
    router.replace("/login");
    router.refresh();
  }

  function activeFor(item: (typeof baseNavigation)[number]) {
    if (item.href === "/") return pathname === "/" || pathname === "/dashboard";
    if (pathname.startsWith(item.href)) return true;
    return "aliases" in item && item.aliases.some((alias) => pathname.startsWith(alias));
  }

  return (
    <div className={`base-app ${collapsed ? "base-app-collapsed" : ""}`}>
      <a className="base-skip-link" href="#base-main">Skip to content</a>
      {mobileOpen && <button className="base-mobile-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside id="base-sidebar-navigation" className={`base-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Main navigation">
        <div className="base-sidebar-head">
          <BaseLogo compact={collapsed} />
          <button type="button" className="base-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="base-nav">
          {baseNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeFor(item);
            return (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={`base-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}>
                <span className="base-nav-icon"><Icon size={20} strokeWidth={2.15} /></span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && "badge" in item && item.badge && <b className="base-nav-badge">{item.badge}</b>}
              </Link>
            );
          })}
        </nav>
        <div className="base-sidebar-bottom">
          {!collapsed && (
            <div className="base-upgrade-card" aria-label="Upgrade account">
              <span className="base-upgrade-string" />
              <span className="base-upgrade-gem"><i /><i /></span>
              <Link href="/settings?section=plan">Upgrade Now</Link>
            </div>
          )}
          <div className="base-user-card">
            <BaseAvatar src="/avatars/john.jpg" name={displayName} />
            {!collapsed && <span><strong>{displayName}</strong><small>{displayEmail}</small></span>}
            {!collapsed && (
              <button type="button" aria-label={`Log out ${displayName}`} title="Log out" onClick={handleSignOut}>
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
        <button className="base-collapse-control" type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
      <div className="base-mobile-bar">
        <BaseLogo />
        <button type="button" aria-label="Open navigation" aria-controls="base-sidebar-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
      </div>
      <main id="base-main" className="base-main" tabIndex={-1}>{children}</main>
      <ScrollToTop />
    </div>
  );
}

export default BaseShell;
