"use client";

import {
  ArrowLeft,
  Award,
  Box,
  Camera,
  ChevronDown,
  Footprints,
  Headphones,
  MoreHorizontal,
  Package,
  Plus,
  Shirt,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Watch,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "./toast-provider";
import { useOverlayScrollLock } from "./use-overlay-scroll-lock";

type AnalyticsTab = "product" | "customer";
type ProductTone = "blue" | "violet" | "rose" | "peach" | "mint";
type ProductIcon = "headphones" | "package" | "shoes" | "shirt" | "watch" | "phone";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  totalOrders: number;
  totalSales: number;
  tone: ProductTone;
  icon: ProductIcon;
  featured: boolean;
};

type ProductDraft = {
  name: string;
  brand: string;
  price: string;
  negotiable: boolean;
  description: string;
};

const initialProducts: Product[] = [
  {
    id: "product-bluetooth",
    name: "Bluetooth Devices",
    brand: "Soundcore",
    price: 10,
    totalOrders: 34666,
    totalSales: 346660,
    tone: "blue",
    icon: "headphones",
    featured: true,
  },
  {
    id: "product-airdot",
    name: "Airdot",
    brand: "Redmi",
    price: 15,
    totalOrders: 20000,
    totalSales: 300000,
    tone: "violet",
    icon: "package",
    featured: true,
  },
  {
    id: "product-shoes",
    name: "Shoes",
    brand: "Stride",
    price: 10,
    totalOrders: 15000,
    totalSales: 150000,
    tone: "rose",
    icon: "shoes",
    featured: true,
  },
  {
    id: "product-shirt",
    name: "Kids T-Shirt",
    brand: "Mini Club",
    price: 12,
    totalOrders: 10000,
    totalSales: 120000,
    tone: "peach",
    icon: "shirt",
    featured: false,
  },
  {
    id: "product-watch",
    name: "Smart Watch",
    brand: "Aster",
    price: 12,
    totalOrders: 10000,
    totalSales: 120000,
    tone: "mint",
    icon: "watch",
    featured: false,
  },
];

const monthlyProducts = [
  { label: "Jan", value: 23400, tone: "coral" },
  { label: "Feb", value: 15000, tone: "blue" },
  { label: "Mar", value: 30000, tone: "coral" },
  { label: "Apr", value: 22000, tone: "blue" },
  { label: "May", value: 10000, tone: "blue" },
  { label: "Jun", value: 23400, tone: "coral" },
  { label: "Jul", value: 5000, tone: "blue" },
];

const productSegments = [
  { label: "Electronics", value: 48, tone: "blue" },
  { label: "Accessories", value: 29, tone: "yellow" },
  { label: "Apparel", value: 23, tone: "coral" },
];

const customerRows = [
  { id: "customer-1", name: "Emma Richardson", initials: "ER", orders: 98, products: 164, revenue: 18420, tone: "blue" },
  { id: "customer-2", name: "Noah Williams", initials: "NW", orders: 84, products: 132, revenue: 15680, tone: "violet" },
  { id: "customer-3", name: "Olivia Bennett", initials: "OB", orders: 71, products: 108, revenue: 12940, tone: "rose" },
  { id: "customer-4", name: "Liam Anderson", initials: "LA", orders: 63, products: 92, revenue: 10780, tone: "mint" },
  { id: "customer-5", name: "Sophia Martinez", initials: "SM", orders: 58, products: 84, revenue: 9640, tone: "peach" },
];

function formatIndianNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function ProductGlyph({ icon }: { icon: ProductIcon }) {
  if (icon === "headphones") return <Headphones size={18} />;
  if (icon === "shoes") return <Footprints size={18} />;
  if (icon === "shirt") return <Shirt size={18} />;
  if (icon === "watch") return <Watch size={18} />;
  if (icon === "phone") return <Smartphone size={18} />;
  return <Package size={18} />;
}

function ProductTrend({ values, tone, label }: { values: number[]; tone: "blue" | "yellow"; label: string }) {
  const maximum = Math.max(...values, 1);
  return (
    <div className={`base-product-trend base-product-trend--${tone}`} role="img" aria-label={`${label}: ${values.join(", ")}`}>
      {values.map((value, index) => (
        <span
          className="base-product-trend-bar"
          aria-hidden="true"
          style={{ height: `${Math.max(14, value / maximum * 100)}%` }}
          key={`${value}-${index}`}
        />
      ))}
    </div>
  );
}

function MonthlyProductChart() {
  const maximum = Math.max(...monthlyProducts.map((item) => item.value));
  return (
    <div className="base-monthly-product-chart" role="img" aria-label="Products added by month: January 23,400, February 15,000, March 30,000, April 22,000, May 10,000, June 23,400, July 5,000">
      {monthlyProducts.map((item) => (
        <div className="base-monthly-product-row" aria-hidden="true" key={item.label}>
          <span>{item.label}</span>
          <span className="base-monthly-product-track">
            <i className={`base-monthly-product-fill base-monthly-product-fill--${item.tone}`} style={{ width: `${item.value / maximum * 100}%` }} />
          </span>
          <strong>{formatIndianNumber(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function ProductSalesRing() {
  return (
    <div className="base-product-ring-layout">
      <div className="base-product-ring" role="img" aria-label="Product sales: Electronics 48 percent, Accessories 29 percent, Apparel 23 percent">
        <span className="base-product-ring-center" aria-hidden="true"><TrendingUp size={22} /></span>
      </div>
      <ul className="base-product-ring-legend" aria-label="Product sales legend">
        {productSegments.map((segment) => (
          <li key={segment.label}>
            <span className={`base-product-ring-dot base-product-ring-dot--${segment.tone}`} aria-hidden="true" />
            <span>{segment.label}</span>
            <strong>{segment.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddProductDrawer({
  draft,
  fileName,
  onDraftChange,
  onFileNameChange,
  onClose,
  onSave,
}: {
  draft: ProductDraft;
  fileName: string;
  onDraftChange: (draft: ProductDraft) => void;
  onFileNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="base-drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="base-product-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-product-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="base-product-drawer-header">
          <button className="base-product-drawer-back" type="button" aria-label="Close add product drawer" onClick={onClose}>
            <ArrowLeft size={18} />
          </button>
          <h2 id="base-product-drawer-title">Add a New Product</h2>
          <button className="base-product-drawer-close" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <label className="base-product-photo-control">
          <Camera size={22} aria-hidden="true" />
          <span>{fileName || "Add product photo"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onFileNameChange(event.target.files?.[0]?.name ?? "")}
          />
        </label>

        <div className="base-product-form">
          <label className="base-product-field">
            <span>Product Name</span>
            <input
              autoFocus
              value={draft.name}
              placeholder="Macbook Pro 2021 14″"
              onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
            />
          </label>

          <label className="base-product-field">
            <span>Brand</span>
            <span className="base-product-select-wrap">
              <select value={draft.brand} onChange={(event) => onDraftChange({ ...draft, brand: event.target.value })}>
                <option>Apple</option>
                <option>Samsung</option>
                <option>Soundcore</option>
                <option>Redmi</option>
                <option>Other</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </span>
          </label>

          <div className="base-product-price-row">
            <label className="base-product-field">
              <span>Price</span>
              <span className="base-product-price-input">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  placeholder="1200"
                  onChange={(event) => onDraftChange({ ...draft, price: event.target.value })}
                />
              </span>
            </label>
            <label className="base-product-checkbox">
              <input
                type="checkbox"
                checked={draft.negotiable}
                onChange={(event) => onDraftChange({ ...draft, negotiable: event.target.checked })}
              />
              <span>Negotiable</span>
            </label>
          </div>

          <label className="base-product-field">
            <span>Descriptions</span>
            <textarea
              rows={5}
              value={draft.description}
              placeholder="Share a concise description of this product."
              onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
            />
          </label>
        </div>

        <footer className="base-product-drawer-actions">
          <button className="base-secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button
            className="base-primary-button"
            type="button"
            disabled={!draft.name.trim() || !draft.brand || !draft.price || Number(draft.price) < 0}
            onClick={onSave}
          >
            <Plus size={16} aria-hidden="true" />
            Add Product
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function ProductAnalyticsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("product");
  const [products, setProducts] = useState(initialProducts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [startDate, setStartDate] = useState("2021-06-10");
  const [endDate, setEndDate] = useState("2021-10-10");
  const [draft, setDraft] = useState<ProductDraft>({
    name: "Macbook Pro 2021 14″",
    brand: "Apple",
    price: "1200",
    negotiable: true,
    description: "The new Apple notebook balances desktop-class performance with all-day mobility and a brilliant display.",
  });

  const totals = useMemo(() => ({
    orders: products.reduce((sum, product) => sum + product.totalOrders, 0),
    sales: products.reduce((sum, product) => sum + product.totalSales, 0),
  }), [products]);

  useOverlayScrollLock(drawerOpen, () => setDrawerOpen(false));

  function openDrawer() {
    setDraft({
      name: "Macbook Pro 2021 14″",
      brand: "Apple",
      price: "1200",
      negotiable: true,
      description: "The new Apple notebook balances desktop-class performance with all-day mobility and a brilliant display.",
    });
    setFileName("");
    setDrawerOpen(true);
  }

  function addProduct() {
    const price = Number(draft.price);
    if (!draft.name.trim() || !draft.brand || !Number.isFinite(price) || price < 0) return;
    setProducts((items) => [
      {
        id: `product-${Date.now()}`,
        name: draft.name.trim(),
        brand: draft.brand,
        price,
        totalOrders: 0,
        totalSales: 0,
        tone: "blue",
        icon: "phone",
        featured: false,
      },
      ...items,
    ]);
    setDrawerOpen(false);
    showToast(`${draft.name.trim()} was added to products.`, { title: "Product added" });
  }

  return (
    <div className="base-page base-product-analytics-page">
      <header className="base-page-heading base-product-page-heading">
        <div>
          <span className="base-eyebrow">Dashboard</span>
          <h1>Product Analytics</h1>
        </div>
        <div className="base-product-date-range" aria-label="Analytics date range">
          <label>
            <span className="base-visually-hidden">Start date</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <span aria-hidden="true">to</span>
          <label>
            <span className="base-visually-hidden">End date</span>
            <input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button className="base-primary-button" type="button" onClick={openDrawer}>
            <Plus size={16} aria-hidden="true" /> Add Product
          </button>
        </div>
      </header>

      <div className="base-product-tab-row">
        <div className="base-product-tabs" role="tablist" aria-label="Analytics entity">
          {(["product", "customer"] as AnalyticsTab[]).map((tab) => (
            <button
              className={activeTab === tab ? "base-is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button className="base-primary-button base-product-mobile-add" type="button" onClick={openDrawer}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="base-product-analytics-grid">
        <main className="base-product-main-column">
          <section className="base-product-kpi-grid" aria-label="Product key metrics">
            <article className="base-product-kpi-card">
              <div className="base-product-kpi-top">
                <span className="base-product-kpi-icon base-product-kpi-icon--blue"><Box size={21} /></span>
                <span className="base-product-kpi-copy">
                  <small>{activeTab === "product" ? "Total Product" : "Total Customers"}</small>
                  <strong>{activeTab === "product" ? formatIndianNumber(500874 + (products.length - initialProducts.length)) : "1,84,942"}</strong>
                </span>
                <span className="base-product-kpi-change">+1400 New Added</span>
              </div>
              <ProductTrend values={[24, 26, 38, 34, 52, 66, 51, 45, 49, 60, 72, 79, 76, 91]} tone="blue" label="Total product growth trend" />
            </article>

            <article className="base-product-kpi-card">
              <div className="base-product-kpi-top">
                <span className="base-product-kpi-icon base-product-kpi-icon--yellow"><ShoppingCart size={21} /></span>
                <span className="base-product-kpi-copy">
                  <small>{activeTab === "product" ? "Total Sales" : "Customer Value"}</small>
                  <strong>{activeTab === "product" ? formatIndianNumber(234888 + Math.round(totals.sales * 0.001)) : "$8,42,680"}</strong>
                </span>
                <span className="base-product-kpi-change">+1000 Sales Today</span>
              </div>
              <ProductTrend values={[52, 43, 47, 55, 48, 71, 78, 58, 42, 38, 44, 53, 61, 59, 49, 72]} tone="yellow" label="Total sales trend" />
            </article>
          </section>

          <section className="base-product-table-card">
            <header className="base-product-card-header">
              <h2>{activeTab === "product" ? "Top Selling Products" : "Top Customers"}</h2>
              <button type="button" onClick={() => showToast("All available demo records are already displayed.", { tone: "info", title: "End of list" })}>See More</button>
            </header>

            {activeTab === "product" ? (
              <div className="base-product-table-wrap" role="region" aria-label="Products table" tabIndex={0}>
                <table className="base-product-table">
                  <thead>
                    <tr>
                      <th scope="col">SN</th>
                      <th scope="col">Name</th>
                      <th scope="col">Price</th>
                      <th scope="col">Total Order</th>
                      <th scope="col">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product.id}>
                        <td>{product.featured ? <span className="base-product-award" aria-label={`Rank ${index + 1}`}><Award size={16} /></span> : index + 1}</td>
                        <td>
                          <span className={`base-product-table-icon base-product-table-icon--${product.tone}`} aria-hidden="true"><ProductGlyph icon={product.icon} /></span>
                          <span className="base-product-name-cell"><strong>{product.name}</strong><small>{product.brand}</small></span>
                        </td>
                        <td>${formatIndianNumber(product.price)}</td>
                        <td>{formatIndianNumber(product.totalOrders)} Piece</td>
                        <td className="base-product-sales-cell">${formatIndianNumber(product.totalSales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="base-product-table-wrap" role="region" aria-label="Customer analytics table" tabIndex={0}>
                <table className="base-product-table base-customer-table">
                  <thead><tr><th scope="col">SN</th><th scope="col">Customer</th><th scope="col">Orders</th><th scope="col">Products</th><th scope="col">Revenue</th></tr></thead>
                  <tbody>
                    {customerRows.map((customer, index) => (
                      <tr key={customer.id}>
                        <td>{index + 1}</td>
                        <td><span className={`base-product-customer-avatar base-product-customer-avatar--${customer.tone}`}>{customer.initials}</span><strong>{customer.name}</strong></td>
                        <td>{customer.orders}</td>
                        <td>{customer.products}</td>
                        <td className="base-product-sales-cell">${formatIndianNumber(customer.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <aside className="base-product-insights-column">
          <section className="base-product-chart-card">
            <header className="base-product-card-header"><h2>Product Add by Month</h2></header>
            <MonthlyProductChart />
          </section>
          <section className="base-product-chart-card">
            <header className="base-product-card-header">
              <h2>Product Sales Analytics</h2>
              <button type="button" aria-label="Product sales options" onClick={() => showToast("Product sales options are not connected in this frontend demo.", { tone: "info", title: "Demo feature" })}><MoreHorizontal size={18} /></button>
            </header>
            <ProductSalesRing />
          </section>
        </aside>
      </div>

      {drawerOpen ? (
        <AddProductDrawer
          draft={draft}
          fileName={fileName}
          onDraftChange={setDraft}
          onFileNameChange={setFileName}
          onClose={() => setDrawerOpen(false)}
          onSave={addProduct}
        />
      ) : null}
    </div>
  );
}
