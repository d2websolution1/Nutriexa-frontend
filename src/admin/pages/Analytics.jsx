import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config";

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
function AreaChart({ data = [], dataKey = "revenue", isDark = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[220px] flex items-center justify-center text-xs text-gray-400">
        No trend data available for this range
      </div>
    );
  }

  const W = 700,
    H = 220,
    PAD = { top: 25, right: 25, bottom: 40, left: 65 };

  const vals = data.map((d) => Number(d[dataKey] || 0));
  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);

  const minV = rawMin === rawMax ? 0 : Math.max(0, rawMin * 0.9);
  const maxV = rawMax === 0 ? 1000 : rawMax * 1.15;
  const rangeV = Math.max(1, maxV - minV);

  function getX(i) {
    if (data.length <= 1) return PAD.left + (W - PAD.left - PAD.right) / 2;
    return PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
  }

  function getY(v) {
    return PAD.top + (1 - (v - minV) / rangeV) * (H - PAD.top - PAD.bottom);
  }

  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${getX(i).toFixed(1)},${getY(Number(d[dataKey] || 0)).toFixed(1)}`)
    .join(" ");

  const area = `${line} L${getX(data.length - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${PAD.left},${(
    H - PAD.bottom
  ).toFixed(1)} Z`;

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => minV + (i / (tickCount - 1)) * rangeV);

  const activePoint = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

  return (
    <div className="w-full overflow-x-auto relative select-none">
      <div className="min-w-[540px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[220px]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
              <stop offset="90%" stopColor="#6366f1" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Y Grid Lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={getY(v)}
                y2={getY(v)}
                stroke={isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 10}
                y={getY(v) + 3}
                textAnchor="end"
                fontSize="10"
                fontFamily="inherit"
                fontWeight="500"
                fill={isDark ? "#94a3b8" : "#64748b"}
              >
                {dataKey === "revenue"
                  ? v >= 100000
                    ? `₹${(v / 100000).toFixed(1)}L`
                    : v >= 1000
                    ? `₹${(v / 1000).toFixed(1)}K`
                    : `₹${Math.round(v)}`
                  : Math.round(v)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={area} fill="url(#areaChartGradient)" />

          {/* Line */}
          <path
            d={line}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* X Labels */}
          {data.map((d, i) => {
            const step = Math.max(1, Math.floor(data.length / 8));
            if (i % step !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={H - PAD.bottom + 22}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill={isDark ? "#94a3b8" : "#64748b"}
              >
                {d.label}
              </text>
            );
          })}

          {/* Interactive Hover Vertical Line & Dots */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              x2={getX(hoveredIndex)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}

          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(Number(d[dataKey] || 0));
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                {/* Hit area */}
                <circle cx={cx} cy={cy} r={14} fill="transparent" />
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? "#4f46e5" : "#6366f1"}
                  stroke={isDark ? "#111722" : "#ffffff"}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && hoveredIndex !== null && (
          <div
            className="absolute pointer-events-none -top-1 px-3 py-1.5 rounded-lg shadow-lg text-xs border backdrop-blur-md transition-all z-20"
            style={{
              left: `${Math.min(
                Math.max(10, (getX(hoveredIndex) / W) * 100 - 8),
                80
              )}%`,
              backgroundColor: isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            <div className="font-semibold text-gray-500 dark:text-gray-400 text-[11px]">
              {activePoint.label}
            </div>
            <div className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {dataKey === "revenue"
                ? `₹${Number(activePoint.revenue || 0).toLocaleString("en-IN")}`
                : `${activePoint.orders || 0} Orders`}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {dataKey === "revenue"
                ? `${activePoint.orders || 0} Orders placed`
                : `Revenue: ₹${Number(activePoint.revenue || 0).toLocaleString("en-IN")}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data = [], isDark = false }) {
  const validData = data.filter((d) => d.percentage > 0);
  const R = 60,
    CX = 80,
    CY = 80;

  if (!validData || validData.length === 0) {
    return (
      <svg viewBox="0 0 160 160" className="w-[160px] h-[160px]">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="20" />
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={isDark ? "#94a3b8" : "#64748b"}
        >
          No Data
        </text>
      </svg>
    );
  }

  // If a single item accounts for 100%
  if (validData.length === 1 || validData[0].percentage >= 99.5) {
    return (
      <svg viewBox="0 0 160 160" className="w-[160px] h-[160px]">
        <circle
          cx={CX}
          cy={CY}
          r={48}
          fill="none"
          stroke={validData[0].color || "#6366f1"}
          strokeWidth="24"
        />
        <circle cx={CX} cy={CY} r={36} fill={isDark ? "#111722" : "#ffffff"} />
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

  let cumulative = 0;
  function slice(pct) {
    const clampedPct = Math.min(pct, 99.9);
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += clampedPct;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(start),
      y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end),
      y2 = CY + R * Math.sin(end);
    const large = clampedPct > 50 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(
      2
    )} ${y2.toFixed(2)} Z`;
  }

  return (
    <svg viewBox="0 0 160 160" className="w-[160px] h-[160px]">
      {validData.map((d) => (
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

  // Real Database Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      let rangeParam = "7d";
      if (timeRange === "Last 30 Days") rangeParam = "30d";
      else if (timeRange === "Last 3 Months") rangeParam = "90d";
      else if (timeRange === "All Time") rangeParam = "all";

      const res = await fetch(`${API_URL}/api/admin/analytics?range=${rangeParam}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load database analytics (${res.status})`);
      }

      const data = await res.json();
      if (data && data.success) {
        setAnalyticsData(data);
      } else {
        throw new Error(data.message || "Failed to parse analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load real database analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totals = analyticsData?.totals || {
    revenue: 0,
    orders: 0,
    avgOrder: 0,
    revenueChange: "0.0%",
    ordersChange: "0.0%",
    avgOrderChange: "0.0%",
    allTimeRevenue: 0,
    allTimeOrders: 0,
  };

  const chartData = analyticsData?.chartData || [];
  const topProducts = analyticsData?.topProducts || [];
  const categoryBreakdown = analyticsData?.categoryBreakdown || [];
  const retention = analyticsData?.customerRetention || {
    rate: 0,
    newCustomersPct: 100,
    returningCustomersPct: 0,
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    change: "0.0%",
    list: [
      { label: "New", value: 100, count: 0, color: "#6366f1" },
      { label: "Returning", value: 0, count: 0, color: "#10b981" },
    ],
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <FiBarChart2 className="text-emerald-500" /> Analytics
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
              ● Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time revenue trends, sales performance, and verified customer database metrics.
          </p>
        </div>

        {/* Time range switcher & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {["Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"].map((r) => {
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

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={loading || refreshing}
            title="Refresh database metrics"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 cursor-pointer flex items-center gap-1.5 transition"
          >
            <FiRefreshCw className={refreshing ? "animate-spin text-indigo-500" : ""} size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAnalytics(false)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totals.revenue),
            subLabel: totals.revenue ? `₹${Number(totals.revenue).toLocaleString("en-IN")}` : "₹0",
            icon: <FiDollarSign size={20} />,
            change: totals.revenueChange,
            isPositive: !String(totals.revenueChange).startsWith("-"),
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40",
          },
          {
            label: "Total Orders",
            value: totals.orders.toLocaleString("en-IN"),
            subLabel: `${totals.allTimeOrders || 0} All-time orders`,
            icon: <FiShoppingBag size={20} />,
            change: totals.ordersChange,
            isPositive: !String(totals.ordersChange).startsWith("-"),
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40",
          },
          {
            label: "Avg. Order Value",
            value: `₹${Number(totals.avgOrder || 0).toLocaleString("en-IN")}`,
            subLabel: `From ${totals.orders || 0} orders`,
            icon: <FiTrendingUp size={20} />,
            change: totals.avgOrderChange,
            isPositive: !String(totals.avgOrderChange).startsWith("-"),
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
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {loading ? (
                    <div className="h-7 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  ) : (
                    c.value
                  )}
                </div>
                {!loading && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                      c.isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {c.isPositive ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
                    {c.change}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.label}</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                {c.subLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue / Orders Chart */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {chartMetric === "revenue" ? "Revenue Trend" : "Order Volume"}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({timeRange})
              </span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Hover over points to inspect exact date and volume.
            </p>
          </div>
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

        {loading ? (
          <div className="h-[220px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <FiRefreshCw className="animate-spin text-indigo-500" size={24} />
              <span className="text-xs text-gray-400 font-medium">Fetching database trends...</span>
            </div>
          </div>
        ) : (
          <AreaChart data={chartData} dataKey={chartMetric} isDark={isAdminDark} />
        )}
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              Top Selling Products
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Ranked by revenue
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No product sales recorded in the database yet.
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => {
                const maxRev = Math.max(1, Number(topProducts[0]?.revenue || 1));
                const pRev = Number(p.revenue || 0);
                const widthPct = Math.max(4, Math.round((pRev / maxRev) * 100));

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {p.category} · {p.units} {p.units === 1 ? "unit" : "units"} sold
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white shrink-0">
                        ₹{pRev.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4">
            Sales by Category
          </h3>
          <div className="flex justify-center mb-5 shrink-0">
            {loading ? (
              <div className="w-[160px] h-[160px] rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
            ) : (
              <DonutChart data={categoryBreakdown} isDark={isAdminDark} />
            )}
          </div>
          <div className="space-y-2 mt-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-4">No categories recorded yet</div>
            ) : (
              categoryBreakdown.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-200 truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {c.percentage}%
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{Number(c.revenue || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Customer Retention */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4">
          Customer Retention & Loyalty
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 w-full space-y-3">
            {retention.list.map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {r.label} Customers ({r.count || 0})
                  </span>
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
              {retention.rate}%
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Repeat Customer Rate
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {retention.totalCustomers} total verified buyers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
