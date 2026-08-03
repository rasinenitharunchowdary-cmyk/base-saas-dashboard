"use client";

import Link from "next/link";
import {
  CalendarDays,
  Camera,
  Download,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useToast } from "./toast-provider";

type InvoiceProduct = {
  id: number;
  name: string;
  rate: number;
  quantity: number;
};

type InvoiceForm = {
  invoiceId: string;
  date: string;
  name: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  notes: string;
  discount: number;
};

const initialProducts: InvoiceProduct[] = [
  { id: 1, name: "Website redesign", rate: 15, quantity: 60 },
  { id: 2, name: "Newsletter template design", rate: 12, quantity: 20 },
];

const invoiceDraftStorageKey = "base-saas-invoice-drafts";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatPreviewDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function CreateInvoicePage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<InvoiceForm>({
    invoiceId: "#876370",
    date: "2021-01-01",
    name: "John Smith",
    email: "companymail@gmail.com",
    address: "4304 Liberty Avenue",
    city: "92680 Tustin, CA",
    phone: "+386 714 505 8385",
    notes:
      "All amounts are in dollars. Please make the payment within 15 days from the issue date of this invoice.",
    discount: 5,
  });
  const [products, setProducts] = useState<InvoiceProduct[]>(initialProducts);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const subtotal = useMemo(
    () => products.reduce((total, product) => total + product.rate * product.quantity, 0),
    [products],
  );
  const discountAmount = subtotal * (form.discount / 100);
  const total = subtotal - discountAmount;

  function updateForm<Key extends keyof InvoiceForm>(key: Key, value: InvoiceForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateProduct(id: number, changes: Partial<InvoiceProduct>) {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...changes } : product)),
    );
  }

  function addProduct() {
    setProducts((current) => [
      ...current,
      { id: Date.now(), name: "New service", rate: 0, quantity: 1 },
    ]);
    showToast("A new product row was added.", { title: "Product added" });
  }

  function removeProduct(id: number) {
    setProducts((current) => current.filter((product) => product.id !== id));
    showToast("The product row was removed.", { title: "Product removed" });
  }

  function selectLogo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Choose a valid image file.", { tone: "error", title: "Upload failed" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoPreview(reader.result);
        showToast("Company logo uploaded.", { title: "Logo ready" });
      }
    };
    reader.readAsDataURL(file);
  }

  function downloadInvoice() {
    const lines = [
      `INVOICE ${form.invoiceId}`,
      `Date: ${formatPreviewDate(form.date)}`,
      "",
      `Recipient: ${form.name}`,
      `${form.address}, ${form.city}`,
      `${form.email} · ${form.phone}`,
      "",
      ...products.map(
        (product) =>
          `${product.name} — ${product.quantity} × ${money.format(product.rate)} = ${money.format(product.quantity * product.rate)}`,
      ),
      "",
      `Subtotal: ${money.format(subtotal)}`,
      `Discount (${form.discount}%): ${money.format(discountAmount)}`,
      `Total: ${money.format(total)}`,
      "",
      form.notes,
    ];
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.invoiceId.replace("#", "invoice-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${form.invoiceId} download started.`, { title: "Download ready" });
  }

  function submitInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const stored = window.localStorage.getItem(invoiceDraftStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      const drafts = Array.isArray(parsed) ? parsed : [];
      const draft = {
        ...form,
        products,
        savedAt: new Date().toISOString(),
        totals: { discount: discountAmount, subtotal, total },
      };
      const nextDrafts = [
        draft,
        ...drafts.filter((item) => (
          typeof item !== "object" || item === null || item.invoiceId !== form.invoiceId
        )),
      ].slice(0, 20);
      window.localStorage.setItem(invoiceDraftStorageKey, JSON.stringify(nextDrafts));
      showToast(`Invoice ${form.invoiceId} was saved as a browser draft.`, { title: "Draft saved" });
    } catch {
      showToast("Your browser could not save this invoice draft.", { tone: "error", title: "Save failed" });
    }
  }

  return (
    <section className="base-create-invoice-page" aria-labelledby="base-create-invoice-title">
      <form className="base-create-invoice-form-card" onSubmit={submitInvoice}>
        <h1 id="base-create-invoice-title">Create New Invoice</h1>

        <div className="base-invoice-logo-upload">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="base-sr-only"
            onChange={(event) => selectLogo(event.target.files?.[0])}
          />
          <button
            type="button"
            className="base-invoice-logo-button"
            aria-label="Upload company logo"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Uploaded company logo" />
            ) : (
              <Camera size={28} aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="base-invoice-form-grid">
          <label className="base-invoice-field">
            <span>Invoice Id</span>
            <input
              required
              value={form.invoiceId}
              onChange={(event) => updateForm("invoiceId", event.target.value)}
            />
          </label>
          <label className="base-invoice-field">
            <span>Date</span>
            <span className="base-invoice-input-with-icon">
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => updateForm("date", event.target.value)}
              />
              <CalendarDays size={18} aria-hidden="true" />
            </span>
          </label>
          <label className="base-invoice-field base-invoice-field-wide">
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
            />
          </label>
          <label className="base-invoice-field">
            <span>Email</span>
            <span className="base-invoice-input-with-icon">
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
              />
              <Mail size={17} aria-hidden="true" />
            </span>
          </label>
          <label className="base-invoice-field">
            <span>Address</span>
            <span className="base-invoice-input-with-icon">
              <input
                required
                value={form.address}
                onChange={(event) => updateForm("address", event.target.value)}
              />
              <MapPin size={18} aria-hidden="true" />
            </span>
          </label>
          <label className="base-invoice-field">
            <span>City / postal code</span>
            <input
              required
              value={form.city}
              onChange={(event) => updateForm("city", event.target.value)}
            />
          </label>
          <label className="base-invoice-field">
            <span>Phone</span>
            <span className="base-invoice-input-with-icon">
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
              <Phone size={17} aria-hidden="true" />
            </span>
          </label>
        </div>

        <div className="base-product-section">
          <div className="base-product-section-heading">
            <h2>Product Description</h2>
            <button type="button" className="base-product-add" aria-label="Add product" onClick={addProduct}>
              <Plus size={20} />
            </button>
          </div>
          <div className="base-product-table" role="table" aria-label="Invoice products">
            <div className="base-product-header" role="row">
              <span role="columnheader">Product Name</span>
              <span role="columnheader">Rate</span>
              <span role="columnheader">QTY</span>
              <span role="columnheader">Amount</span>
              <span role="columnheader" className="base-sr-only">Actions</span>
            </div>
            {products.map((product, index) => (
              <div className="base-product-row" role="row" key={product.id}>
                <label role="cell">
                  <span className="base-sr-only">Product {index + 1} name</span>
                  <input
                    required
                    value={product.name}
                    onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                  />
                </label>
                <label role="cell" className="base-product-number-field">
                  <span aria-hidden="true">$</span>
                  <span className="base-sr-only">Product {index + 1} rate</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.rate}
                    aria-label={`Product ${index + 1} rate`}
                    onChange={(event) => updateProduct(product.id, { rate: Number(event.target.value) })}
                  />
                </label>
                <label role="cell" className="base-product-quantity-field">
                  <span className="base-sr-only">Product {index + 1} quantity</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={product.quantity}
                    aria-label={`Product ${index + 1} quantity`}
                    onChange={(event) => updateProduct(product.id, { quantity: Number(event.target.value) })}
                  />
                  <span aria-hidden="true">Pcs</span>
                </label>
                <output role="cell">{money.format(product.rate * product.quantity)}</output>
                <button
                  type="button"
                  className="base-product-delete"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => removeProduct(product.id)}
                  disabled={products.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="base-invoice-form-grid base-invoice-form-footer-grid">
          <label className="base-invoice-field">
            <span>Discount</span>
            <span className="base-invoice-discount-input">
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(event) => updateForm("discount", Number(event.target.value))}
              />
              <span aria-hidden="true">%</span>
            </span>
          </label>
          <label className="base-invoice-field base-invoice-field-wide">
            <span>Notes</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
            />
          </label>
        </div>

        <div className="base-create-invoice-actions">
          <Link className="base-secondary-button" href="/invoices">Cancel</Link>
          <button className="base-primary-button" type="submit">Save Invoice</button>
        </div>
      </form>

      <aside className="base-invoice-preview-card" aria-labelledby="base-invoice-preview-heading">
        <header className="base-invoice-preview-header">
          <h2 id="base-invoice-preview-heading">Preview</h2>
          <div className="base-invoice-preview-actions">
            <button type="button" aria-label="Download invoice" onClick={downloadInvoice}>
              <Download size={21} />
            </button>
            <button type="button" aria-label="Print invoice" onClick={() => window.print()}>
              <Printer size={21} />
            </button>
          </div>
        </header>

        <article className="base-invoice-paper">
          <div className="base-invoice-paper-top">
            <div className="base-invoice-paper-logo">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Company logo" />
              ) : (
                <span aria-label="J company logo">J</span>
              )}
            </div>
            <div className="base-invoice-sender">
              <span><Mail size={10} aria-hidden="true" /> your.mail@gmail.com</span>
              <span><Phone size={10} aria-hidden="true" /> +386 989 271 3115</span>
            </div>
          </div>

          <div className="base-invoice-paper-summary">
            <address className="base-invoice-recipient">
              <span>Recipient</span>
              <strong>{form.name || "Recipient name"}</strong>
              <p>{form.address || "Street address"}</p>
              <p>{form.city || "City, postal code"}</p>
              <p>VAT no.: 12345678</p>
              <a href={`mailto:${form.email}`}><Mail size={9} aria-hidden="true" /> {form.email || "email@example.com"}</a>
              <a href={`tel:${form.phone}`}><Phone size={9} aria-hidden="true" /> {form.phone || "+000 000 000"}</a>
            </address>
            <div className="base-invoice-document-meta">
              <h3>Invoice</h3>
              <dl>
                <div><dt>Invoice no.</dt><dd>{form.invoiceId || "—"}</dd></div>
                <div><dt>Invoice date</dt><dd>{formatPreviewDate(form.date)}</dd></div>
              </dl>
            </div>
          </div>

          <div className="base-invoice-preview-items">
            <div className="base-invoice-preview-item-head">
              <span>Task Description</span><span>Hours</span><span>Rate</span><span>Amount</span>
            </div>
            {products.map((product) => (
              <div className="base-invoice-preview-item" key={product.id}>
                <span>{product.name || "Untitled service"}</span>
                <span>{product.quantity}</span>
                <span>{money.format(product.rate)}</span>
                <span>{money.format(product.rate * product.quantity)}</span>
              </div>
            ))}
            <dl className="base-invoice-preview-totals">
              <div><dt>Subtotal</dt><dd>{money.format(subtotal)}</dd></div>
              <div><dt>Discount {form.discount}%</dt><dd>{money.format(discountAmount)}</dd></div>
              <div className="base-invoice-preview-grand-total"><dt>Total</dt><dd>{money.format(total)}</dd></div>
            </dl>
          </div>

          <p className="base-invoice-payment-copy">
            Transfer the amount to the business account below. Please include the invoice number on your check.
          </p>
          <div className="base-invoice-bank-line">
            <span>Bank: <strong>FTSBUS33</strong></span>
            <i aria-hidden="true" />
            <span>IBAN: <strong>GB82-1111-2222-3333</strong></span>
          </div>
          <div className="base-invoice-notes">
            <h3>Notes</h3>
            <p>{form.notes}</p>
            <span>Thank you for your confidence in my work.</span>
            <span className="base-invoice-signature">Signature</span>
          </div>
        </article>
      </aside>
    </section>
  );
}
