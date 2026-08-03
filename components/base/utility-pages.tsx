"use client";

import {
  Bell,
  Check,
  CreditCard,
  Laptop,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { BaseAvatar } from "./base-shell";
import { useToast } from "./toast-provider";

const initialNotifications = [
  { id: 1, name: "Shelby Goode", text: "commented on Dashboard Design", time: "1 min ago", avatar: "/avatars/shelby.jpg", unread: true },
  { id: 2, name: "Robert Bacins", text: "shared the Q4 invoice report", time: "9 min ago", avatar: "/avatars/robert.jpg", unread: true },
  { id: 3, name: "John Carilo", text: "assigned you to Web Design", time: "15 min ago", avatar: "/avatars/john.jpg", unread: true },
  { id: 4, name: "Adriene Watson", text: "added a new calendar event", time: "21 min ago", avatar: "/avatars/adriene.jpg", unread: false },
  { id: 5, name: "Mark Ruffalo", text: "completed Invoice #876364", time: "45 min ago", avatar: "/avatars/mark.jpg", unread: false },
];

export function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter((item) => item.unread).length;

  function markAllAsRead() {
    if (unread === 0) {
      showToast("There are no unread notifications.", { tone: "info", title: "Already up to date" });
      return;
    }
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
    showToast("All notifications marked as read.", { title: "Notifications updated" });
  }

  return (
    <div className="base-page base-notifications-page">
      <header className="base-page-heading">
        <div><h1>Notification</h1><p>You have {unread} unread updates</p></div>
        <button type="button" className="base-ghost-button" onClick={markAllAsRead}><Check size={16} /> Mark all as read</button>
      </header>
      <section className="base-panel base-notification-list">
        {notifications.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`base-notification-row ${item.unread ? "is-unread" : ""}`}
            onClick={() => setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry))}
          >
            <BaseAvatar src={item.avatar} name={item.name} size="large" />
            <span><strong>{item.name}</strong><p>{item.text}</p><small>{item.time}</small></span>
            {item.unread && <i aria-label="Unread" />}
          </button>
        ))}
      </section>
    </div>
  );
}

const settingsTabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Plan & Billing", icon: CreditCard },
] as const;

type ProfileSettings = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
};

const defaultProfile: ProfileSettings = {
  email: "easin@base.com",
  firstName: "Easin",
  lastName: "Arafat",
  phone: "+33757005467",
  role: "Product Manager",
};

const profileStorageKey = "base-saas-profile-settings";

export function SettingsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof settingsTabs)[number]["id"]>("profile");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);

  useEffect(() => {
    const loadProfile = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(profileStorageKey);
        if (!stored) return;
        const next = { ...defaultProfile, ...JSON.parse(stored) } as ProfileSettings;
        setProfile(next);
        setSavedProfile(next);
      } catch {
        window.localStorage.removeItem(profileStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(loadProfile);
  }, []);

  function updateProfile(key: keyof ProfileSettings, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      setSavedProfile(profile);
      showToast("Your profile changes were saved to this browser.", { title: "Changes saved" });
    } catch {
      showToast("Your browser could not save these profile changes.", { tone: "error", title: "Save failed" });
    }
  }

  function resetProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfile(savedProfile);
    showToast("Unsaved profile changes were discarded.", { tone: "info", title: "Changes reset" });
  }

  return <div className="base-page base-settings-page"><header className="base-page-heading"><div><h1>Settings</h1><p>Manage your account and workspace preferences.</p></div></header><div className="base-settings-layout"><nav className="base-settings-nav" aria-label="Settings sections">{settingsTabs.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}><Icon size={18} />{item.label}</button>; })}</nav><section className="base-panel base-settings-panel">
    {tab === "profile" && <form onSubmit={save} onReset={resetProfile}><div className="base-settings-section-heading"><div><h2>Profile Information</h2><p>Update your photo and personal details.</p></div><BaseAvatar src="/avatars/john.jpg" name={`${profile.firstName} ${profile.lastName}`} size="large" /></div><div className="base-form-grid"><label className="base-form-field"><span>First Name</span><input value={profile.firstName} onChange={(event) => updateProfile("firstName", event.target.value)} required /></label><label className="base-form-field"><span>Last Name</span><input value={profile.lastName} onChange={(event) => updateProfile("lastName", event.target.value)} required /></label><label className="base-form-field base-field-wide"><span>Email Address</span><input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} required /></label><label className="base-form-field"><span>Phone Number</span><input value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} /></label><label className="base-form-field"><span>Role</span><input value={profile.role} onChange={(event) => updateProfile("role", event.target.value)} /></label></div><div className="base-settings-actions"><button type="reset" className="base-ghost-button">Cancel</button><button type="submit" className="base-primary-button">Save Changes</button></div></form>}
    {tab === "security" && <div><div className="base-settings-section-heading"><div><h2>Security</h2><p>Keep your account protected.</p></div><span className="base-security-badge"><LockKeyhole size={18} /> Protected</span></div><div className="base-security-list"><div><span><LockKeyhole size={18} /><b>Password</b></span><small>Last changed 24 days ago</small><button type="button" onClick={() => showToast("Password changes are not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>Change</button></div><div><span><Smartphone size={18} /><b>Two-factor authentication</b></span><small>Add an extra layer of security</small><button type="button" onClick={() => showToast("Two-factor setup is not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>Enable</button></div><div><span><Laptop size={18} /><b>Active sessions</b></span><small>2 devices currently signed in</small><button type="button" onClick={() => showToast("Session management is not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>Review</button></div></div></div>}
    {tab === "notifications" && <div><div className="base-settings-section-heading"><div><h2>Notification Preferences</h2><p>Choose what Base should notify you about.</p></div></div><div className="base-toggle-list"><label><span><Mail size={18} /><b>Email notifications</b><small>Invoice, task and schedule updates</small></span><input type="checkbox" checked={emailAlerts} onChange={(event) => setEmailAlerts(event.target.checked)} /></label><label><span><Bell size={18} /><b>Push notifications</b><small>Messages and time-sensitive alerts</small></span><input type="checkbox" checked={pushAlerts} onChange={(event) => setPushAlerts(event.target.checked)} /></label></div></div>}
    {tab === "billing" && <div><div className="base-plan-card"><span>Growth Plan</span><strong>$49<small>/month</small></strong><p>For growing teams that need advanced analytics and unlimited projects.</p><button className="base-primary-button" type="button" onClick={() => showToast("Billing management is not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}>Manage Plan</button></div><div className="base-usage-list"><h3>Usage this month</h3><label><span>Team members <b>8 / 12</b></span><i><em style={{ width: "67%" }} /></i></label><label><span>File storage <b>34GB / 100GB</b></span><i><em style={{ width: "34%" }} /></i></label></div></div>}
  </section></div></div>;
}
