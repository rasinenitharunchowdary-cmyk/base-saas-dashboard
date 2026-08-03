"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  Ellipsis,
  Mail,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type InvoiceStatus = "Complete" | "Pending" | "Cancel";

type BaseInvoice = {
  id: string;
  name: string;
  initials: string;
  email: string;
  date: string;
  dateValue: string;
  status: InvoiceStatus;
  avatarTone: string;
  favorite: boolean;
};

const seedInvoices: BaseInvoice[] = [
  {
    id: "#876364",
    name: "Arrora gaur",
    initials: "AG",
    email: "arroragaur@gmail.com",
    date: "12 Dec, 2020",
    dateValue: "2020-12-12",
    status: "Complete",
    avatarTone: "lilac",
    favorite: true,
  },
  {
    id: "#876123",
    name: "James Mullican",
    initials: "JM",
    email: "jamesmullican@gmail.com",
    date: "10 Dec, 2020",
    dateValue: "2020-12-10",
    status: "Pending",
    avatarTone: "aqua",
    favorite: true,
  },
  {
    id: "#876213",
    name: "Robert Bacins",
    initials: "RB",
    email: "robertbacins@gmail.com",
    date: "09 Dec, 2020",
    dateValue: "2020-12-09",
    status: "Complete",
    avatarTone: "rose",
    favorite: false,
  },
  {
    id: "#876987",
    name: "Bethany Jackson",
    initials: "BJ",
    email: "bethanyjackson@gmail.com",
    date: "09 Dec, 2020",
    dateValue: "2020-12-09",
    status: "Cancel",
    avatarTone: "sky",
    favorite: false,
  },
  {
    id: "#871345",
    name: "Anne Jacob",
    initials: "AJ",
    email: "annejacob@gmail.com",
    date: "10 Dec, 2020",
    dateValue: "2020-12-10",
    status: "Complete",
    avatarTone: "peach",
    favorite: false,
  },
  {
    id: "#872345",
    name: "Bethany jackson",
    initials: "BJ",
    email: "bethanyjackson@gmail.com",
    date: "10 Dec, 2020",
    dateValue: "2020-12-10",
    status: "Pending",
    avatarTone: "lime",
    favorite: true,
  },
  {
    id: "#872346",
    name: "James Mullican",
    initials: "JM",
    email: "jamesmullican@gmail.com",
    date: "10 Dec, 2020",
    dateValue: "2020-12-10",
    status: "Complete",
    avatarTone: "cyan",
    favorite: false,
  },
  {
    id: "#873245",
    name: "Jhon Deo",
    initials: "JD",
    email: "jhondeo32@gmail.com",
    date: "08 Dec, 2020",
    dateValue: "2020-12-08",
    status: "Complete",
    avatarTone: "blush",
    favorite: true,
  },
  {
    id: "#873892",
    name: "Shelby Goode",
    initials: "SG",
    email: "shelbygoode@gmail.com",
    date: "07 Dec, 2020",
    dateValue: "2020-12-07",
    status: "Pending",
    avatarTone: "violet",
    favorite: false,
  },
];

type SortKey = "id" | "name" | "email" | "dateValue" | "status";

function BaseAvatar({ invoice }: { invoice: BaseInvoice }) {
  return (
    <span
      className={`base-invoice-avatar base-avatar-${invoice.avatarTone}`}
      aria-label={invoice.name}
      title={invoice.name}
    >
      {invoice.initials}
    </span>
  );
}

export function InvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState(seedInvoices);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(["#876213", "#876987", "#872345"]),
  );
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(seedInvoices.filter((invoice) => invoice.favorite).map((invoice) => invoice.id)),
  );
  const [sortKey, setSortKey] = useState<SortKey>("dateValue");
  const [ascending, setAscending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<BaseInvoice | null>(null);

  useOverlayScrollLock(Boolean(editingInvoice), () => setEditingInvoice(null));

  const visibleInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices
      .filter((invoice) =>
        !query
          ? true
          : `${invoice.id} ${invoice.name} ${invoice.email} ${invoice.status}`
              .toLowerCase()
              .includes(query),
      )
      .sort((left, right) => {
        const comparison = left[sortKey].localeCompare(right[sortKey]);
        return ascending ? comparison : -comparison;
      });
  }, [ascending, invoices, search, sortKey]);

  const allVisibleSelected =
    visibleInvoices.length > 0 && visibleInvoices.every((invoice) => selectedIds.has(invoice.id));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAscending((current) => !current);
    else {
      setSortKey(key);
      setAscending(true);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleInvoices.forEach((invoice) => next.delete(invoice.id));
      else visibleInvoices.forEach((invoice) => next.add(invoice.id));
      return next;
    });
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function deleteInvoice(id: string) {
    setInvoices((current) => current.filter((invoice) => invoice.id !== id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setOpenMenuId(null);
    showToast(`Invoice ${id} deleted.`, { title: "Invoice deleted" });
  }

  function deleteSelected() {
    const count = selectedIds.size;
    setInvoices((current) => current.filter((invoice) => !selectedIds.has(invoice.id)));
    setSelectedIds(new Set());
    showToast(`${count} invoice${count === 1 ? "" : "s"} deleted.`, { title: "Invoices deleted" });
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingInvoice) return;
    setInvoices((current) =>
      current.map((invoice) => (invoice.id === editingInvoice.id ? editingInvoice : invoice)),
    );
    showToast(`Invoice ${editingInvoice.id} updated.`, { title: "Changes saved" });
    setEditingInvoice(null);
  }

  return (
    <section className="base-invoices-page" aria-labelledby="base-invoice-list-heading">
      <header className="base-invoices-header">
        <h1 id="base-invoice-list-heading">Invoice List</h1>
        <div className="base-invoices-header-actions">
          <label className="base-invoices-search">
            <span className="base-sr-only">Search invoices</span>
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Search size={18} aria-hidden="true" />
          </label>
          <Link className="base-primary-button base-invoices-add" href="/invoices/new">
            <Plus size={19} aria-hidden="true" />
            <span>Add New</span>
          </Link>
        </div>
      </header>

      <div className="base-invoices-table-wrap" role="region" aria-label="Invoices table" tabIndex={0}>
        <table className="base-invoices-table">
          <thead>
            <tr>
              <th scope="col" className="base-invoice-check-cell">
                <input
                  type="checkbox"
                  aria-label="Select all visible invoices"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                />
              </th>
              {[
                ["id", "Invoice Id"],
                ["name", "Name"],
                ["email", "Email"],
                ["dateValue", "Date"],
                ["status", "Status"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  scope="col"
                  aria-sort={sortKey === key ? (ascending ? "ascending" : "descending") : "none"}
                >
                  <button
                    className="base-invoice-sort"
                    type="button"
                    onClick={() => toggleSort(key as SortKey)}
                  >
                    {label}<ChevronDown size={12} aria-hidden="true" />
                  </button>
                </th>
              ))}
              <th scope="col" className="base-invoice-favorite-heading">
                <span className="base-sr-only">Favorite</span>
              </th>
              <th scope="col" className="base-invoice-action-heading">
                <button
                  type="button"
                  className="base-invoice-delete-selected"
                  aria-label="Delete selected invoices"
                  disabled={selectedIds.size === 0}
                  onClick={deleteSelected}
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleInvoices.map((invoice) => (
              <tr key={invoice.id} className={selectedIds.has(invoice.id) ? "base-invoice-row-selected" : ""}>
                <td className="base-invoice-check-cell">
                  <input
                    type="checkbox"
                    aria-label={`Select invoice ${invoice.id}`}
                    checked={selectedIds.has(invoice.id)}
                    onChange={() => toggleSelection(invoice.id)}
                  />
                </td>
                <td className="base-invoice-id"><strong>{invoice.id}</strong></td>
                <td>
                  <span className="base-invoice-person">
                    <BaseAvatar invoice={invoice} />
                    <strong>{invoice.name}</strong>
                  </span>
                </td>
                <td>
                  <a className="base-invoice-email" href={`mailto:${invoice.email}`}>
                    <span className="base-invoice-email-icon"><Mail size={13} aria-hidden="true" /></span>
                    {invoice.email}
                  </a>
                </td>
                <td>
                  <span className="base-invoice-date">
                    <CalendarDays size={15} aria-hidden="true" />
                    <time dateTime={invoice.dateValue}>{invoice.date}</time>
                  </span>
                </td>
                <td>
                  <span className={`base-invoice-status base-invoice-status-${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="base-invoice-favorite-cell">
                  <button
                    type="button"
                    className={`base-invoice-favorite ${favorites.has(invoice.id) ? "base-invoice-favorite-active" : ""}`}
                    aria-label={`${favorites.has(invoice.id) ? "Remove" : "Add"} ${invoice.id} ${favorites.has(invoice.id) ? "from" : "to"} favorites`}
                    aria-pressed={favorites.has(invoice.id)}
                    onClick={() => toggleFavorite(invoice.id)}
                  >
                    <Star size={19} fill={favorites.has(invoice.id) ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="base-invoice-action-cell">
                  <button
                    type="button"
                    className="base-invoice-more"
                    aria-label={`More actions for ${invoice.id}`}
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === invoice.id}
                    onClick={() => setOpenMenuId((current) => current === invoice.id ? null : invoice.id)}
                  >
                    <Ellipsis size={19} />
                  </button>
                  {openMenuId === invoice.id && (
                    <div className="base-invoice-row-menu" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        className="base-invoice-menu-edit"
                        onClick={() => {
                          setEditingInvoice({ ...invoice });
                          setOpenMenuId(null);
                        }}
                      >
                        <Pencil size={13} aria-hidden="true" />Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="base-invoice-menu-delete"
                        onClick={() => deleteInvoice(invoice.id)}
                      >
                        <Trash2 size={13} aria-hidden="true" />Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleInvoices.length === 0 && (
          <div className="base-invoices-empty">
            <Search size={24} aria-hidden="true" />
            <h2>No invoices found</h2>
            <p>Try a different invoice number, customer name, or email.</p>
            <button type="button" onClick={() => setSearch("")}>Clear search</button>
          </div>
        )}
      </div>

      {editingInvoice && (
        <div className="base-invoice-modal-layer">
          <button
            type="button"
            className="base-invoice-modal-scrim"
            aria-label="Close invoice editor"
            onClick={() => setEditingInvoice(null)}
          />
          <div
            className="base-invoice-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="base-edit-invoice-title"
          >
            <header className="base-invoice-modal-header">
              <div>
                <span>Edit invoice</span>
                <h2 id="base-edit-invoice-title">{editingInvoice.id}</h2>
              </div>
              <button type="button" aria-label="Close invoice editor" onClick={() => setEditingInvoice(null)}>
                <X size={18} />
              </button>
            </header>
            <form className="base-invoice-edit-form" onSubmit={saveEdit}>
              <label>
                <span>Name</span>
                <input
                  required
                  value={editingInvoice.name}
                  onChange={(event) => setEditingInvoice({ ...editingInvoice, name: event.target.value })}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={editingInvoice.email}
                  onChange={(event) => setEditingInvoice({ ...editingInvoice, email: event.target.value })}
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={editingInvoice.status}
                  onChange={(event) => setEditingInvoice({ ...editingInvoice, status: event.target.value as InvoiceStatus })}
                >
                  <option>Complete</option>
                  <option>Pending</option>
                  <option>Cancel</option>
                </select>
              </label>
              <div className="base-invoice-modal-actions">
                <button type="button" className="base-secondary-button" onClick={() => setEditingInvoice(null)}>Cancel</button>
                <button type="submit" className="base-primary-button">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
