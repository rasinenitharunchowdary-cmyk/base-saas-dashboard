"use client";

import {
  Camera,
  ChevronDown,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type Gender = "Male" | "Female" | "Non-binary";
type CustomerSort = "name" | "email" | "phone" | "gender";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  role: string;
  address: string;
  avatar: string;
  performance: number[];
};

const initialCustomers: Customer[] = [
  {
    id: "customer-1",
    firstName: "John",
    lastName: "Deo",
    email: "johndeo2211@gmail.com",
    phone: "+33757005467",
    gender: "Male",
    role: "UI/UX Designer",
    address: "2239 Hog Camp Road\nSchaumburg",
    avatar: "https://i.pravatar.cc/160?img=12",
    performance: [34, 68, 52, 39, 76, 92],
  },
  {
    id: "customer-2",
    firstName: "Shelby",
    lastName: "Goode",
    email: "shelbygoode481@gmail.com",
    phone: "+33757005467",
    gender: "Female",
    role: "Product Designer",
    address: "84 Chapel Street\nManchester",
    avatar: "https://i.pravatar.cc/160?img=47",
    performance: [42, 57, 48, 72, 66, 84],
  },
  {
    id: "customer-3",
    firstName: "Robert",
    lastName: "Bacins",
    email: "robertbacins4182@.com",
    phone: "+33757005467",
    gender: "Male",
    role: "Marketing Manager",
    address: "172 Park Avenue\nBrooklyn",
    avatar: "https://i.pravatar.cc/160?img=68",
    performance: [51, 64, 58, 71, 79, 86],
  },
  {
    id: "customer-4",
    firstName: "John",
    lastName: "Carilo",
    email: "john carilo182@.com",
    phone: "+33757805467",
    gender: "Male",
    role: "Frontend Developer",
    address: "41 South Street\nLondon",
    avatar: "https://i.pravatar.cc/160?img=11",
    performance: [33, 45, 61, 54, 73, 80],
  },
  {
    id: "customer-5",
    firstName: "Adriene",
    lastName: "Watson",
    email: "adrienewatson82@.com",
    phone: "+83757305467",
    gender: "Female",
    role: "Account Director",
    address: "8 Kingfisher Lane\nBristol",
    avatar: "https://i.pravatar.cc/160?img=44",
    performance: [29, 48, 60, 67, 72, 88],
  },
  {
    id: "customer-6",
    firstName: "Jhon",
    lastName: "Deo",
    email: "jhondeo24823@.com",
    phone: "+63475700546",
    gender: "Male",
    role: "Motion Designer",
    address: "502 Linden Avenue\nAustin",
    avatar: "https://i.pravatar.cc/160?img=14",
    performance: [45, 40, 57, 69, 63, 75],
  },
  {
    id: "customer-7",
    firstName: "Mark",
    lastName: "Ruffalo",
    email: "markruffalo3735@.com",
    phone: "+33757005467",
    gender: "Male",
    role: "Creative Director",
    address: "310 Harbor Drive\nSan Diego",
    avatar: "https://i.pravatar.cc/160?img=3",
    performance: [37, 54, 59, 73, 81, 89],
  },
  {
    id: "customer-8",
    firstName: "Bethany",
    lastName: "Jackson",
    email: "bethanyjackson5@.com",
    phone: "+33757005467",
    gender: "Female",
    role: "Research Lead",
    address: "76 Hawthorne Way\nPortland",
    avatar: "https://i.pravatar.cc/160?img=45",
    performance: [32, 49, 53, 64, 77, 83],
  },
  {
    id: "customer-9",
    firstName: "Christine",
    lastName: "Huston",
    email: "christinehuston4@.com",
    phone: "+33757005467",
    gender: "Male",
    role: "Brand Strategist",
    address: "19 Lake View\nChicago",
    avatar: "https://i.pravatar.cc/160?img=56",
    performance: [48, 52, 64, 61, 74, 91],
  },
  {
    id: "customer-10",
    firstName: "Serena",
    lastName: "Clark",
    email: "serenaclark81@.com",
    phone: "+33757995462",
    gender: "Female",
    role: "Project Manager",
    address: "33 Oakfield Road\nLeeds",
    avatar: "https://i.pravatar.cc/160?img=32",
    performance: [28, 43, 55, 68, 70, 82],
  },
];

function fullName(customer: Customer) {
  return `${customer.firstName} ${customer.lastName}`;
}

function CustomerAvatar({ customer, large = false }: { customer: Customer; large?: boolean }) {
  return (
    <span
      className={`base-customer-avatar ${large ? "base-customer-avatar-large" : ""}`}
      style={{ backgroundImage: `url(${customer.avatar})` }}
      aria-hidden="true"
    >
      <span>{customer.firstName[0]}{customer.lastName[0]}</span>
    </span>
  );
}

function CustomerDetails({ customer }: { customer: Customer }) {
  const { showToast } = useToast();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const peakIndex = customer.performance.indexOf(Math.max(...customer.performance));

  return (
    <aside className="base-customer-details" aria-label={`${fullName(customer)} details`}>
      <div className="base-customer-details-profile">
        <CustomerAvatar customer={customer} large />
        <h2>{fullName(customer)}</h2>
        <p>{customer.role}</p>
      </div>

      <section className="base-customer-contact" aria-labelledby="base-customer-contact-title">
        <h3 id="base-customer-contact-title">Contact Info</h3>
        <a href={`mailto:${customer.email}`}><Mail size={17} /><span>{customer.email}</span></a>
        <a href={`tel:${customer.phone.replace(/\s/g, "")}`}><Phone size={17} /><span>{customer.phone}</span></a>
        <div><MapPin size={18} /><span>{customer.address.split("\n").map((line) => <span key={line}>{line}</span>)}</span></div>
      </section>

      <section className="base-customer-performance" aria-labelledby="base-customer-performance-title">
        <div className="base-customer-card-heading">
          <h3 id="base-customer-performance-title">Performance</h3>
          <button type="button" aria-label="Performance options" onClick={() => showToast("Performance options are not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}><MoreHorizontal size={18} /></button>
        </div>
        <div className="base-customer-chart" aria-label="Monthly customer performance">
          {customer.performance.map((value, index) => (
            <div className="base-customer-chart-column" key={months[index]}>
              <div className="base-customer-chart-bar-wrap">
                {index === 1 && <span className="base-customer-chart-value">2.33k</span>}
                <span
                  className={`base-customer-chart-bar ${index === 1 ? "base-customer-chart-bar-active" : ""}`}
                  style={{ height: `${value}%` }}
                  aria-label={`${months[index]}: ${value} percent`}
                />
              </div>
              <small className={index === peakIndex ? "base-customer-chart-peak" : ""}>{months[index]}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="base-customer-detail-stats">
        <div><span>Projects</span><strong>18</strong><small>+3 this month</small></div>
        <div><span>Task done</span><strong>82%</strong><small>Above average</small></div>
      </div>
    </aside>
  );
}

function CustomerFormDrawer({
  customer,
  onClose,
  onSave,
}: {
  customer?: Customer;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}) {
  const [avatar, setAvatar] = useState(customer?.avatar ?? "");
  const mode = customer ? "edit" : "add";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    onSave({
      id: customer?.id ?? `customer-${Date.now()}`,
      firstName,
      lastName,
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      gender: String(data.get("gender") ?? "Male") as Gender,
      role: String(data.get("role") ?? "Customer").trim(),
      address: String(data.get("address") ?? "Address not added").trim(),
      avatar: avatar || `https://i.pravatar.cc/160?u=${encodeURIComponent(`${firstName}-${lastName}`)}`,
      performance: customer?.performance ?? [28, 44, 53, 61, 72, 84],
    });
  }

  function choosePhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => setAvatar(String(reader.result ?? "")), { once: true });
    reader.readAsDataURL(file);
  }

  return (
    <aside className="base-customer-form-drawer" role="dialog" aria-modal="true" aria-labelledby="base-customer-form-title">
      <div className="base-customer-form-heading">
        <h2 id="base-customer-form-title">{mode === "add" ? "Add Customer" : "Edit Customer"}</h2>
        <button type="button" aria-label="Close customer form" onClick={onClose}><X size={18} /></button>
      </div>

      <form className="base-customer-form" onSubmit={submit}>
        <label className="base-customer-photo-picker">
          <input
            className="base-sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => choosePhoto(event.target.files?.[0])}
          />
          {avatar ? (
            <span className="base-customer-photo-preview" style={{ backgroundImage: `url(${avatar})` }} />
          ) : (
            <Camera size={25} />
          )}
          <span className="base-sr-only">Choose customer photo</span>
        </label>

        <label><span>First Name</span><input name="firstName" required autoFocus defaultValue={customer?.firstName ?? ""} placeholder="John" autoComplete="given-name" /></label>
        <label><span>Last Name</span><input name="lastName" required defaultValue={customer?.lastName ?? ""} placeholder="Deo" autoComplete="family-name" /></label>
        <label><span>Email</span><input name="email" required type="email" defaultValue={customer?.email ?? ""} placeholder="Example@gmail.com" autoComplete="email" /></label>
        <label><span>Phone Number</span><input name="phone" required type="tel" defaultValue={customer?.phone ?? ""} placeholder="33757005467" autoComplete="tel" /></label>
        <label>
          <span>Gender</span>
          <span className="base-customer-select-wrap">
            <select name="gender" defaultValue={customer?.gender ?? "Male"}>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </span>
        </label>
        <label><span>Role</span><input name="role" required defaultValue={customer?.role ?? ""} placeholder="UI/UX Designer" autoComplete="organization-title" /></label>
        <label><span>Address</span><textarea name="address" rows={3} defaultValue={customer?.address ?? ""} placeholder="Street and city" autoComplete="street-address" /></label>

        <div className="base-customer-form-actions">
          <button className="base-button-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="base-button-primary" type="submit">
            <Plus size={16} /> {mode === "add" ? "Add Customer" : "Save Changes"}
          </button>
        </div>
      </form>
    </aside>
  );
}

export function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedId, setSelectedId] = useState(initialCustomers[0].id);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ mode: "add" } | { mode: "edit"; customerId: string } | null>(null);
  const [sort, setSort] = useState<{ key: CustomerSort; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((left, right) => {
      const leftValue = sort.key === "name" ? fullName(left) : left[sort.key];
      const rightValue = sort.key === "name" ? fullName(right) : right[sort.key];
      const compared = leftValue.localeCompare(rightValue);
      return sort.direction === "asc" ? compared : -compared;
    });
  }, [customers, sort]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? customers[0] ?? null;
  const editingCustomer = drawer?.mode === "edit" ? customers.find((customer) => customer.id === drawer.customerId) : undefined;

  useOverlayScrollLock(Boolean(drawer), () => setDrawer(null));

  useEffect(() => {
    function closeOverlays(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuId(null);
      }
    }
    window.addEventListener("keydown", closeOverlays);
    return () => window.removeEventListener("keydown", closeOverlays);
  }, []);

  function sortBy(key: CustomerSort) {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  }

  function deleteCustomer(customer: Customer) {
    setCustomers((current) => current.filter((item) => item.id !== customer.id));
    if (selectedId === customer.id) {
      setSelectedId(customers.find((item) => item.id !== customer.id)?.id ?? "");
    }
    setMenuId(null);
    showToast(`${fullName(customer)} deleted.`, { title: "Customer deleted" });
  }

  function saveCustomer(customer: Customer) {
    const exists = customers.some((item) => item.id === customer.id);
    setCustomers((current) => exists
      ? current.map((item) => item.id === customer.id ? customer : item)
      : [customer, ...current]);
    setSelectedId(customer.id);
    setDrawer(null);
    showToast(`${fullName(customer)} ${exists ? "updated" : "added"}.`, { title: exists ? "Customer updated" : "Customer added" });
  }

  return (
    <div className={`base-customers-page ${drawer ? "base-customers-page-drawer-open" : ""}`}>
      <main className="base-customers-main">
        <header className="base-customers-header">
          <div><span className="base-customers-eyebrow">Contacts</span><h1>Customer List</h1></div>
          <button className="base-button-primary" type="button" onClick={() => { setDrawer({ mode: "add" }); setMenuId(null); }}>
            <Plus size={17} /> Add Customer
          </button>
        </header>

        <div className="base-customer-table-wrap" role="region" aria-label="Customers table" tabIndex={0}>
          <div className="base-customer-mobile-sort" aria-label="Sort customers">
            {([
              ["name", "Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["gender", "Gender"],
            ] as Array<[CustomerSort, string]>).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={sort.key === key}
                onClick={() => sortBy(key)}
              >
                <span>{label}</span>
                <ChevronDown size={11} className={sort.key === key && sort.direction === "desc" ? "base-customer-sort-desc" : ""} />
              </button>
            ))}
          </div>
          <table className="base-customer-table">
            <caption className="base-sr-only">Customer names and contact information</caption>
            <thead>
              <tr>
                {([
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone number"],
                  ["gender", "Gender"],
                ] as Array<[CustomerSort, string]>).map(([key, label]) => (
                  <th key={key} scope="col">
                    <button type="button" onClick={() => sortBy(key)} aria-label={`Sort by ${label}`}>
                      {label}<ChevronDown size={11} className={sort.key === key && sort.direction === "desc" ? "base-customer-sort-desc" : ""} />
                    </button>
                  </th>
                ))}
                <th scope="col"><span className="base-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer) => (
                <tr key={customer.id} className={selectedId === customer.id ? "base-customer-row-selected" : ""}>
                  <td>
                    <button className="base-customer-name" type="button" onClick={() => { setSelectedId(customer.id); setMenuId(null); }}>
                      <CustomerAvatar customer={customer} />
                      <span>{fullName(customer)}</span>
                    </button>
                  </td>
                  <td><a href={`mailto:${customer.email}`}>{customer.email}</a></td>
                  <td><a href={`tel:${customer.phone.replace(/\s/g, "")}`}>{customer.phone}</a></td>
                  <td><span className={`base-customer-gender base-customer-gender-${customer.gender.toLowerCase().replace("-", "")}`}>{customer.gender}</span></td>
                  <td className="base-customer-action-cell">
                    <button
                      className="base-customer-more"
                      type="button"
                      aria-label={`Actions for ${fullName(customer)}`}
                      aria-expanded={menuId === customer.id}
                      onClick={() => setMenuId((current) => current === customer.id ? null : customer.id)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuId === customer.id && (
                      <div className="base-customer-row-menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => { setDrawer({ mode: "edit", customerId: customer.id }); setMenuId(null); }}><Pencil size={13} /> Edit</button>
                        <button className="base-customer-row-menu-delete" type="button" role="menuitem" onClick={() => deleteCustomer(customer)}><Trash2 size={13} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="base-customers-empty">
              <h2>No customers yet</h2>
              <p>Add your first customer to start building the directory.</p>
              <button className="base-button-primary" type="button" onClick={() => setDrawer({ mode: "add" })}><Plus size={16} /> Add Customer</button>
            </div>
          )}
        </div>
      </main>

      {drawer ? (
        <CustomerFormDrawer customer={editingCustomer} onClose={() => setDrawer(null)} onSave={saveCustomer} />
      ) : selectedCustomer ? (
        <CustomerDetails customer={selectedCustomer} />
      ) : null}
    </div>
  );
}

export default CustomersPage;
