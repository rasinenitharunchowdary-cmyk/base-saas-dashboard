"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BriefcaseBusiness,
  ChevronDown,
  Heart,
  Package,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { BaseAvatar } from "./base-shell";
import { useToast } from "./toast-provider";

const reportData = [
  { time: "10am", sales: 54 },
  { time: "11am", sales: 31 },
  { time: "12am", sales: 58 },
  { time: "01am", sales: 36 },
  { time: "02am", sales: 24 },
  { time: "03am", sales: 49 },
  { time: "04am", sales: 14 },
  { time: "05am", sales: 35 },
  { time: "06am", sales: 68 },
  { time: "07am", sales: 74 },
];

const metricCards = [
  { value: "178+", label: "Save Products", icon: Heart, tone: "blue" },
  { value: "20+", label: "Stock Products", icon: WalletCards, tone: "yellow" },
  { value: "190+", label: "Sales Products", icon: ShoppingBag, tone: "coral" },
  { value: "12+", label: "Job Application", icon: BriefcaseBusiness, tone: "violet" },
];

const recentOrders = [
  { id: "#876364", product: "Nike Air Max", price: "$86.00", orders: "16 Piece", amount: "$1,376", status: "Complete" },
  { id: "#876123", product: "Smart Watch", price: "$69.00", orders: "12 Piece", amount: "$828", status: "Pending" },
  { id: "#876213", product: "Apple Macbook", price: "$1,250", orders: "3 Piece", amount: "$3,750", status: "Complete" },
  { id: "#876987", product: "Bluetooth Headset", price: "$36.00", orders: "8 Piece", amount: "$288", status: "Cancel" },
];

const products = [
  { name: "NIKE Shoes Black Pattern", type: "Shoes", price: "$87.00", tone: "blue" },
  { name: "Apple Smart Watch", type: "Electronics", price: "$129.00", tone: "yellow" },
  { name: "Wireless Headset", type: "Accessories", price: "$62.00", tone: "coral" },
];

function DashboardTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="base-report-tooltip"><span>{label}</span><strong>Sales<br />{(payload[0].value * 54.65).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>;
}

export function DashboardPage() {
  const { showToast } = useToast();
  const [fromDate, setFromDate] = useState("10-06-2021");
  const [toDate, setToDate] = useState("10-10-2021");

  function showDemoOptions(section: string) {
    showToast(`${section} options are not connected in this frontend demo.`, { tone: "info", title: "Demo feature" });
  }

  return (
    <div className="base-page base-dashboard-page">
      <header className="base-page-heading base-dashboard-heading">
        <h1>Dashboard</h1>
        <div className="base-date-controls">
          <label><span className="sr-only">Start date</span><select value={fromDate} onChange={(event) => setFromDate(event.target.value)}><option>10-06-2021</option><option>10-07-2021</option><option>10-08-2021</option></select><ChevronDown size={14} /></label>
          <label><span className="sr-only">End date</span><select value={toDate} onChange={(event) => setToDate(event.target.value)}><option>10-10-2021</option><option>10-11-2021</option><option>10-12-2021</option></select><ChevronDown size={14} /></label>
        </div>
      </header>

      <section className="base-kpi-grid" aria-label="Dashboard metrics">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return <article className="base-kpi-card" key={metric.label}><span className={`base-kpi-icon base-tone-${metric.tone}`}><Icon size={22} fill="currentColor" /></span><div><strong>{metric.value}</strong><span>{metric.label}</span></div></article>;
        })}
      </section>

      <section className="base-dashboard-chart-grid">
        <article className="base-panel base-reports-panel">
          <div className="base-panel-heading"><h2>Reports</h2><button type="button" aria-label="Reports options" onClick={() => showDemoOptions("Report")}>•••</button></div>
          <div className="base-report-chart" role="img" aria-label="Sales report from 10am through 7am, trending from 54 to 74">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="baseLineGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#51b9ee" /><stop offset="52%" stopColor="#a269e7" /><stop offset="100%" stopColor="#ef4fe9" /></linearGradient>
                  <linearGradient id="baseAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b287ee" stopOpacity="0.24" /><stop offset="100%" stopColor="#b287ee" stopOpacity="0" /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ececf2" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#9a9aa7", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#9a9aa7", fontSize: 12 }} />
                <Tooltip content={<DashboardTooltip />} cursor={{ stroke: "#4b4a61", strokeDasharray: "3 4" }} />
                <Area type="monotone" dataKey="sales" stroke="url(#baseLineGradient)" strokeWidth={4} fill="url(#baseAreaGradient)" activeDot={{ r: 6, stroke: "#9368df", strokeWidth: 3, fill: "white" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="base-panel base-analytics-panel">
          <div className="base-panel-heading"><h2>Analytics</h2><button type="button" aria-label="Analytics options" onClick={() => showDemoOptions("Analytics")}>•••</button></div>
          <div className="base-donut-wrap">
            <div className="base-donut" role="img" aria-label="Transactions: Sale 48 percent, Distribute 31 percent, Return 21 percent"><span><strong>80%</strong><small>Transactions</small></span></div>
          </div>
          <div className="base-chart-legend"><span><i className="base-legend-blue" />Sale</span><span><i className="base-legend-yellow" />Distribute</span><span><i className="base-legend-coral" />Return</span></div>
        </article>
      </section>

      <section className="base-dashboard-bottom-grid">
        <article className="base-panel base-orders-panel">
          <div className="base-panel-heading"><h2>Recent Orders</h2><button type="button" aria-label="Orders options" onClick={() => showDemoOptions("Order")}>•••</button></div>
          <div className="base-table-scroll" role="region" aria-label="Recent orders table" tabIndex={0}>
            <table className="base-table"><thead><tr><th>Tracking no</th><th>Product Name</th><th>Price</th><th>Total Order</th><th>Total Amount</th><th>Status</th></tr></thead><tbody>{recentOrders.map((order, index) => <tr key={order.id}><td>{order.id}</td><td><span className={`base-product-thumb base-product-thumb-${index + 1}`}><Package size={17} /></span>{order.product}</td><td>{order.price}</td><td>{order.orders}</td><td>{order.amount}</td><td><span className={`base-status base-status-${order.status.toLowerCase()}`}>{order.status}</span></td></tr>)}</tbody></table>
          </div>
        </article>

        <article className="base-panel base-products-panel">
          <div className="base-panel-heading"><h2>Top Selling Products</h2><button type="button" aria-label="Products options" onClick={() => showDemoOptions("Product")}>•••</button></div>
          <div className="base-top-products">{products.map((product, index) => <div className="base-top-product" key={product.name}><span className={`base-product-photo base-product-photo-${product.tone}`}><Package size={22} /></span><div><strong>{product.name}</strong><small>{product.type}</small></div><span>{product.price}</span><BaseAvatar src={`/avatars/${index === 0 ? "shelby" : index === 1 ? "robert" : "adriene"}.jpg`} name="Product manager" size="small" /></div>)}</div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
