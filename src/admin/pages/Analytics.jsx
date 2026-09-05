import { useState, useMemo } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const REVENUE_DATA = {
  "Last 7 Days": [
    { label: "12 May", revenue: 42000, orders: 18 },
    { label: "13 May", revenue: 58500, orders: 24 },
    { label: "14 May", revenue: 36200, orders: 15 },
    { label: "15 May", revenue: 92000, orders: 38 },
    { label: "16 May", revenue: 71000, orders: 29 },
    { label: "17 May", revenue: 84500, orders: 35 },
    { label: "18 May", revenue: 110000, orders: 45 },
  ],
  "Last 30 Days": Array.from({ length: 30 }, (_, i) => ({
    label: `Day ${i + 1}`,
    revenue: Math.floor(30000 + Math.random() * 90000),
    orders: Math.floor(10 + Math.random() * 50),
  })),
  "Last 3 Months": ["Jan", "Feb", "Mar"].map((m) => ({
    label: m,
    revenue: Math.floor(1200000 + Math.random() * 800000),
    orders: Math.floor(350 + Math.random() * 250),
  })),
};

const TOP_PRODUCTS = [
  { name: "Nitro Tech Whey Protein", units: 312, revenue: 778488, category: "Whey Proteins" },
  { name: "Mass Gainer Pro 6KG", units: 198, revenue: 1069002, category: "Mass Gainers" },
  { name: "Pre-Workout Ignite", units: 256, revenue: 665344, category: "Pre-Workouts" },
  { name: "BCAA Ultra Blend", units: 189, revenue: 358110, category: "Amino Acids" },
  { name: "Omega-3 Fish Oil", units: 421, revenue: 546879, category: "Health & Wellness" },
];

const CATEGORY_BREAKDOWN = [
  { name: "Whey Proteins", revenue: 2845000, percentage: 38, color: "#6366f1" },
  { name: "Mass Gainers", revenue: 1980000, percentage: 26, color: "#10b981" },
  { name: "Pre-Workouts", revenue: 1124000, percentage: 15, color: "#f59e0b" },
  { name: "Amino Acids", revenue: 750000, percentage: 10, color: "#8b5cf6" },
  { name: "Health & Wellness", revenue: 546000, percentage: 7, color: "#06b6d4" },
  { name: "Accessories", revenue: 305000, percentage: 4, color: "#ec4899" },
];

const CUSTOMER_RETENTION = [
  { label: "New", value: 58, color: "#6366f1" },
  { label: "Returning", value: 42, color: "#10b981" },
];

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
function AreaChart({ data, dataKey = "revenue" }) {
  const W = 700, H = 200, PAD = { top: 20, right: 20, bottom: 40, left: 60 };
  const vals = data.map((d) => d[dataKey]);
  const minV = Math.min(...vals) * 0.9;
  const maxV = Math.max(...vals) * 1.1;

  function x(i) { return PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right); }
  function y(v) { return PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom); }

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[dataKey]).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${PAD.left},${(H - PAD.bottom).toFixed(1)} Z`;

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => minV + (i / (tickCount - 1)) * (maxV - minV));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "200px" }}>
      <defs>
        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y Grid Lines */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {dataKey === "revenue" ? `₹${(v / 1000).toFixed(0)}K` : v.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={area} fill="url(#aGrad)" />

      {/* Line */}
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* X Labels (show fewer for long datasets) */}
      {data.map((d, i) => {
        const step = Math.max(1, Math.floor(data.length / 7));
        if (i % step !== 0) return null;
        return (
          <text key={i} x={x(i)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {d.label}
          </text>
        );
      })}

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d[dataKey])} r={3.5} fill="#6366f1" stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const R = 60, CX = 80, CY = 80;
  let cumulative = 0;

  function slice(pct) {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(start), y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end), y2 = CY + R * Math.sin(end);
    const large = pct > 50 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <svg viewBox="0 0 160 160" style={{ width: "160px", height: "160px" }}>
      {data.map((d) => (
        <path key={d.name} d={slice(d.percentage)} fill={d.color} />
      ))}
      <circle cx={CX} cy={CY} r={38} fill="#fff" />
      <text x={CX} y={CY - 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">Sales</text>
      <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="#64748b">by Category</text>
    </svg>
  );
}

// ─── Main Analytics Component ─────────────────────────────────────────────────
export default function Analytics() {
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [chartMetric, setChartMetric] = useState("revenue");
  const chartData = REVENUE_DATA[timeRange];

  const totals = useMemo(() => ({
    revenue: chartData.reduce((a, d) => a + d.revenue, 0),
    orders: chartData.reduce((a, d) => a + d.orders, 0),
    avgOrder: Math.round(chartData.reduce((a, d) => a + d.revenue, 0) / chartData.reduce((a, d) => a + d.orders, 0)),
  }), [chartData]);

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Analytics</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Revenue trends, sales performance, and customer insights.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["Last 7 Days", "Last 30 Days", "Last 3 Months"].map((r) => (
            <button key={r} onClick={() => setTimeRange(r)}
              style={{
                padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px",
                fontWeight: 600, cursor: "pointer",
                background: timeRange === r ? "#6366f1" : "#fff",
                color: timeRange === r ? "#fff" : "#64748b",
                transition: "all 0.15s"
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Revenue", value: `₹${(totals.revenue / 1000).toFixed(1)}K`, icon: <FiDollarSign size={20} />, change: "+12.5%", color: "#6366f1", bg: "#eef2ff" },
          { label: "Total Orders", value: totals.orders, icon: <FiShoppingBag size={20} />, change: "+8.3%", color: "#10b981", bg: "#ecfdf5" },
          { label: "Avg. Order Value", value: `₹${totals.avgOrder.toLocaleString()}`, icon: <FiTrendingUp size={20} />, change: "+6.1%", color: "#f59e0b", bg: "#fffbeb" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", background: c.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{c.value}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{c.label}</div>
              <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginTop: "2px" }}>{c.change} vs last period</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            {chartMetric === "revenue" ? "Revenue Trend" : "Order Volume"}
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setChartMetric("revenue")}
              style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: chartMetric === "revenue" ? "#6366f1" : "#fff", color: chartMetric === "revenue" ? "#fff" : "#64748b" }}>
              Revenue
            </button>
            <button onClick={() => setChartMetric("orders")}
              style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: chartMetric === "orders" ? "#6366f1" : "#fff", color: chartMetric === "orders" ? "#fff" : "#64748b" }}>
              Orders
            </button>
          </div>
        </div>
        <AreaChart data={chartData} dataKey={chartMetric} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "20px" }}>
        {/* Top Products */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Top Selling Products</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {TOP_PRODUCTS.map((p, i) => {
              const maxRev = TOP_PRODUCTS[0].revenue;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{p.category} · {p.units} units sold</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>₹{(p.revenue / 1000).toFixed(1)}K</div>
                  </div>
                  <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(p.revenue / maxRev) * 100}%`, background: "#6366f1", borderRadius: "3px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Sales by Category</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <DonutChart data={CATEGORY_BREAKDOWN} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CATEGORY_BREAKDOWN.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#374151" }}>{c.name}</span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{c.percentage}%</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>₹{(c.revenue / 100000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Retention */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Customer Retention</h3>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            {CUSTOMER_RETENTION.map((r) => (
              <div key={r.label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{r.label} Customers</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{r.value}%</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.value}%`, background: r.color, borderRadius: "5px", transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", padding: "20px 30px", background: "#f8fafc", borderRadius: "12px" }}>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a" }}>42%</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Retention Rate</div>
            <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginTop: "4px" }}>↑ +5.2% vs last period</div>
          </div>
        </div>
      </div>
    </div>
  );
}
