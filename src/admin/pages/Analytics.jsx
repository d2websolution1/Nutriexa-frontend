import { useState, useMemo } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

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
function AreaChart({ data, dataKey = "revenue", isDark = false }) {
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
    <div className="w-full overflow-x-auto">
      <div className="min-w-[520px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px]">
          <defs>
            <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y Grid Lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(v)}
                y2={y(v)}
                stroke={isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9"}
                strokeWidth="1"
              />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill={isDark ? "#94a3b8" : "#94a3b8"}>
                {dataKey === "revenue" ? `₹${(v / 1000).toFixed(0)}K` : v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={area} fill="url(#aGrad)" />

          {/* Line */}
          <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* X Labels */}
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
            <circle
              key={i}
              cx={x(i)}
              cy={y(d[dataKey])}
              r={3.5}
              fill="#6366f1"
              stroke={isDark ? "#111722" : "#ffffff"}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, isDark = false }) {
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
    <svg viewBox="0 0 160 160" className="w-[160px] h-[160px]">
      {data.map((d) => (
        <path key={d.name} d={slice(d.percentage)} fill={d.color} />
      ))}
      <circle cx={CX} cy={CY} r={38} fill={isDark ? "#111722" : "#ffffff"} />
      <text
        x={CX}
        y={CY - 5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={isDark ? "#ffffff" : "#0f172a"}
      >
        Sales
      </text>
      <text
        x={CX}
        y={CY + 12}
        textAnchor="middle"
        fontSize="10"
        fill={isDark ? "#94a3b8" : "#64748b"}
      >
        by Category
      </text>
    </svg>
  );
}

// ─── Main Analytics Component ─────────────────────────────────────────────────
export default function Analytics() {
  const { isAdminDark } = useTheme();
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [chartMetric, setChartMetric] = useState("revenue");
  const chartData = REVENUE_DATA[timeRange];

  const totals = useMemo(() => ({
    revenue: chartData.reduce((a, d) => a + d.revenue, 0),
    orders: chartData.reduce((a, d) => a + d.orders, 0),
    avgOrder: Math.round(chartData.reduce((a, d) => a + d.revenue, 0) / chartData.reduce((a, d) => a + d.orders, 0)),
  }), [chartData]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FiBarChart2 className="text-emerald-500" /> Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revenue trends, sales performance, and customer insights.
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {["Last 7 Days", "Last 30 Days", "Last 3 Months"].map((r) => {
            const active = timeRange === r;
            return (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-[#111722] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${(totals.revenue / 1000).toFixed(1)}K`,
            icon: <FiDollarSign size={20} />,
            change: "+12.5%",
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40",
          },
          {
            label: "Total Orders",
            value: totals.orders,
            icon: <FiShoppingBag size={20} />,
            change: "+8.3%",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40",
          },
          {
            label: "Avg. Order Value",
            value: `₹${totals.avgOrder.toLocaleString()}`,
            icon: <FiTrendingUp size={20} />,
            change: "+6.1%",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xs transition hover:border-gray-300 dark:hover:border-white/10"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.color}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {c.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.label}</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {c.change} vs last period
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            {chartMetric === "revenue" ? "Revenue Trend" : "Order Volume"}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartMetric("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                chartMetric === "revenue"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartMetric("orders")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                chartMetric === "orders"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              Orders
            </button>
          </div>
        </div>
        <AreaChart data={chartData} dataKey={chartMetric} isDark={isAdminDark} />
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((p, i) => {
              const maxRev = TOP_PRODUCTS[0].revenue;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {p.category} · {p.units} units sold
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white shrink-0">
                      ₹{(p.revenue / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4">
            Sales by Category
          </h3>
          <div className="flex justify-center mb-5 shrink-0">
            <DonutChart data={CATEGORY_BREAKDOWN} isDark={isAdminDark} />
          </div>
          <div className="space-y-2 mt-auto">
            {CATEGORY_BREAKDOWN.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-gray-700 dark:text-gray-200 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{c.percentage}%</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{(c.revenue / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Retention */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4">
          Customer Retention
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 w-full space-y-3">
            {CUSTOMER_RETENTION.map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{r.label} Customers</span>
                  <span className="font-bold text-gray-900 dark:text-white">{r.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.value}%`, background: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full sm:w-auto text-center px-6 py-5 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 rounded-2xl shrink-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              42%
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Retention Rate</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              ↑ +5.2% vs last period
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
