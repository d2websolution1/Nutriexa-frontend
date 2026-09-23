import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiCreditCard,
  FiCalendar,
  FiChevronDown,
  FiUserPlus,
  FiUserCheck,
  FiUser,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { API_URL as API_BASE } from "../../config";

const STATUS_BADGE = {
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  Shipped: "bg-blue-50 text-blue-700 border border-blue-200/60",
  Processing: "bg-amber-50 text-amber-700 border border-amber-200/60",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200/60",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

const PAYMENT_BADGE = {
  Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  Failed: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("This Week"); // "This Week" | "This Month" | "This Year"
  const [paymentFilter, setPaymentFilter] = useState("all"); // "all" | "paid" | "pending" | "cod"
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const rangeParam = timeRange === "This Month" ? "month" : timeRange === "This Year" ? "year" : "week";
      const res = await fetch(
        `${API_BASE}/api/admin/dashboard?range=${rangeParam}&paymentStatus=${paymentFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to load dashboard data (status ${res.status}).`);
      }

      const json = await res.json();
      setData(json);
      // Highlight the latest point by default
      if (json.timeline && json.timeline.length > 0) {
        setHoveredPointIndex(json.timeline.length - 1);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, paymentFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const timeline = data?.timeline || [];

  // Dynamic max revenue calculation with clean headroom
  const maxRevenue = useMemo(() => {
    if (!timeline.length) return 5000;
    const maxVal = Math.max(...timeline.map((p) => p.revenue), 0);
    if (maxVal === 0) return 5000;
    if (maxVal <= 1000) return 1000;
    if (maxVal <= 5000) return Math.ceil(maxVal / 1000) * 1000;
    if (maxVal <= 25000) return Math.ceil(maxVal / 5000) * 5000;
    if (maxVal <= 100000) return Math.ceil(maxVal / 20000) * 20000;
    return Math.ceil(maxVal / 50000) * 50000;
  }, [timeline]);

  // Calculate 5 Y-axis tick divisions
  const yAxisTicks = useMemo(() => {
    const step = maxRevenue / 5;
    return [
      maxRevenue,
      Math.round(step * 4),
      Math.round(step * 3),
      Math.round(step * 2),
      Math.round(step * 1),
      0,
    ];
  }, [maxRevenue]);

  const formatK = (val) => {
    if (val === 0) return "0";
    if (val >= 100000) {
      const l = val / 100000;
      return `${l % 1 === 0 ? l : l.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
    }
    return `${val}`;
  };

  // Chart coordinate calculations
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = useMemo(() => {
    if (!timeline.length) return [];
    return timeline.map((pt, i) => {
      const x = paddingX + (i / Math.max(timeline.length - 1, 1)) * chartWidth;
      const y = svgHeight - paddingY - (pt.revenue / maxRevenue) * chartHeight;
      return { ...pt, x, y, index: i };
    });
  }, [timeline, maxRevenue, chartWidth, chartHeight]);

  // Generate smooth cubic bezier SVG path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: "", areaPath: "" };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const area = `${d} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
    return { linePath: d, areaPath: area };
  }, [points]);

  // Donut chart calculations from real DB statuses
  const donutData = useMemo(() => {
    const raw = data?.ordersByStatus || {
      Delivered: 0,
      Shipped: 0,
      Processing: 0,
      Pending: 0,
      Cancelled: 0,
      total: 0,
    };
    const segments = [
      { key: "Delivered", label: "Delivered", count: raw.Delivered || 0, color: "#22c55e" },
      { key: "Shipped", label: "Shipped", count: raw.Shipped || 0, color: "#3b82f6" },
      { key: "Processing", label: "Processing", count: raw.Processing || 0, color: "#eab308" },
      { key: "Pending", label: "Pending", count: raw.Pending || 0, color: "#f97316" },
      { key: "Cancelled", label: "Cancelled", count: raw.Cancelled || 0, color: "#ef4444" },
    ];
    const total = segments.reduce((sum, s) => sum + s.count, 0);

    if (total === 0) {
      return { total: 0, slices: [], segments };
    }

    let cumulativeAngle = -90;
    const slices = segments.map((seg) => {
      const angle = (seg.count / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const r = 62;
      const cx = 85;
      const cy = 85;
      const rad1 = (startAngle * Math.PI) / 180;
      const rad2 = (endAngle * Math.PI) / 180;

      const x1 = cx + r * Math.cos(rad1);
      const y1 = cy + r * Math.sin(rad1);
      const x2 = cx + r * Math.cos(rad2);
      const y2 = cy + r * Math.sin(rad2);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData =
        angle >= 360
          ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
          : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...seg,
        pathData,
      };
    });

    return { total, slices, segments };
  }, [data]);

  const activeHoverPoint =
    hoveredPointIndex !== null && points[hoveredPointIndex]
      ? points[hoveredPointIndex]
      : points[points.length - 1] || null;

  const periodLabel =
    timeRange === "This Week"
      ? "last 7 days"
      : timeRange === "This Month"
      ? "last month"
      : "last year";

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading real-time store analytics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-8 max-w-lg mx-auto">
        <FiAlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900 mb-1">Failed to load Dashboard data</h2>
        <p className="text-xs text-rose-700 mb-4">{error}</p>
        <button
          onClick={() => fetchDashboard(false)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-emerald-700 transition"
        >
          <FiRefreshCw size={13} />
          Retry Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Breadcrumbs with Dynamic Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-gray-800">Dashboard</span>
          </p>
        </div>

        {/* Dynamic Date range display & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs">
            <FiCalendar size={14} className="text-gray-500" />
            <span>{data?.dateRangeLabel || "Live Analytics"}</span>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            title="Refresh Real-time Data"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={refreshing ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {/* 5 Top Stat Cards (Real Calculated Period Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/15 text-[#16a34a] flex items-center justify-center font-bold shrink-0">
              <FiDollarSign size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ₹{Number(data?.stats?.revenue?.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                (data?.stats?.revenue?.change || 0) >= 0 ? "text-[#16a34a]" : "text-rose-600"
              }`}
            >
              {(data?.stats?.revenue?.change || 0) >= 0 ? (
                <FiArrowUp size={11} />
              ) : (
                <FiArrowDown size={11} />
              )}
              <span>{Math.abs(data?.stats?.revenue?.change || 0)}% vs {periodLabel}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            Paid: ₹{Number(data?.stats?.revenue?.paid || 0).toLocaleString("en-IN")} • All-time: ₹{Number(data?.stats?.revenue?.allTime || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <FiShoppingBag size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">Total Orders</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {Number(data?.stats?.orders?.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                (data?.stats?.orders?.change || 0) >= 0 ? "text-[#16a34a]" : "text-rose-600"
              }`}
            >
              {(data?.stats?.orders?.change || 0) >= 0 ? (
                <FiArrowUp size={11} />
              ) : (
                <FiArrowDown size={11} />
              )}
              <span>{Math.abs(data?.stats?.orders?.change || 0)}% vs {periodLabel}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            {data?.stats?.orders?.prepaid || 0} Prepaid • {data?.stats?.orders?.cod || 0} COD • All: {data?.stats?.orders?.allTime || 0}
          </p>
        </div>

        {/* 3. Total Customers */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <FiUsers size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">Total Customers</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {Number(data?.stats?.customers?.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                (data?.stats?.customers?.change || 0) >= 0 ? "text-[#16a34a]" : "text-rose-600"
              }`}
            >
              {(data?.stats?.customers?.change || 0) >= 0 ? (
                <FiArrowUp size={11} />
              ) : (
                <FiArrowDown size={11} />
              )}
              <span>{Math.abs(data?.stats?.customers?.change || 0)}% vs {periodLabel}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            +{data?.stats?.customers?.newInPeriod || 0} registered in {timeRange.toLowerCase()}
          </p>
        </div>

        {/* 4. Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <FiTrendingUp size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">Conversion Rate</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {data?.stats?.conversionRate?.value || 0}%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                (data?.stats?.conversionRate?.change || 0) >= 0 ? "text-[#16a34a]" : "text-rose-600"
              }`}
            >
              {(data?.stats?.conversionRate?.change || 0) >= 0 ? (
                <FiArrowUp size={11} />
              ) : (
                <FiArrowDown size={11} />
              )}
              <span>{Math.abs(data?.stats?.conversionRate?.change || 0)}% vs {periodLabel}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            Based on store orders & users
          </p>
        </div>

        {/* 5. Avg. Order Value */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <FiCreditCard size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">Avg. Order Value</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ₹{Number(data?.stats?.avgOrderValue?.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                (data?.stats?.avgOrderValue?.change || 0) >= 0 ? "text-[#16a34a]" : "text-rose-600"
              }`}
            >
              {(data?.stats?.avgOrderValue?.change || 0) >= 0 ? (
                <FiArrowUp size={11} />
              ) : (
                <FiArrowDown size={11} />
              )}
              <span>{Math.abs(data?.stats?.avgOrderValue?.change || 0)}% vs {periodLabel}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 truncate">
            Avg revenue per order
          </p>
        </div>
      </div>

      {/* Main Row: Sales Overview Line Graph + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview Area Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <span>Sales Overview</span>
                <span className="text-[11px] font-semibold text-gray-500">
                  (₹{Number(data?.stats?.revenue?.value || 0).toLocaleString("en-IN")})
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Real database sales & payment metrics
              </p>
            </div>

            {/* Filter Controls: Time Range + Payment Filter */}
            <div className="flex items-center gap-2">
              {/* Payment Filter */}
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid Online/Delivered</option>
                  <option value="pending">Pending COD</option>
                  <option value="cod">All COD</option>
                </select>
                <FiChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none text-gray-400" />
              </div>

              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
                <FiChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          {/* SVG Line Graph with Gradient & Real Hover Tooltip */}
          <div className="relative w-full overflow-hidden select-none min-h-[220px]">
            {/* Tooltip Overlay */}
            {activeHoverPoint && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(activeHoverPoint.x / svgWidth) * 100}%`,
                  top: `${Math.max(12, (activeHoverPoint.y / svgHeight) * 100 - 8)}%`,
                }}
              >
                <div className="bg-[#111827] text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl text-center leading-tight whitespace-nowrap border border-white/10">
                  <p className="text-gray-300 font-medium mb-0.5">{activeHoverPoint.fullDate}</p>
                  <p className="font-bold text-[#4ade80]">
                    Revenue: ₹{Number(activeHoverPoint.revenue).toLocaleString("en-IN")}
                  </p>
                  <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5 mt-0.5">
                    <span>Paid: ₹{Number(activeHoverPoint.paidRevenue || 0).toLocaleString("en-IN")}</span>
                    <span>•</span>
                    <span>Orders: {activeHoverPoint.orders}</span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-[#111827] rotate-45 mx-auto -mt-1" />
              </div>
            )}

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dynamic Y Axis Grid lines and labels */}
              {yAxisTicks.map((k) => {
                const y = paddingY + chartHeight - (k / maxRevenue) * chartHeight;
                return (
                  <g key={k}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9.5"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {formatK(k)}
                    </text>
                  </g>
                );
              })}

              {/* Area Gradient Fill */}
              {areaPath && <path d={areaPath} fill="url(#salesGrad)" />}

              {/* Smooth Curved Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Active pointer vertical indicator line */}
              {activeHoverPoint && (
                <line
                  x1={activeHoverPoint.x}
                  y1={activeHoverPoint.y}
                  x2={activeHoverPoint.x}
                  y2={svgHeight - paddingY}
                  stroke="#22c55e"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Interactive Dots */}
              {points.map((pt) => {
                const isActive = activeHoverPoint?.index === pt.index;
                return (
                  <g
                    key={pt.index}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(pt.index)}
                  >
                    {/* Transparent touch hitbox */}
                    <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                    {isActive ? (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="6" fill="#15803d" />
                        <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" />
                      </>
                    ) : (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={pt.revenue > 0 ? "4" : "2.5"}
                        fill={pt.revenue > 0 ? "#22c55e" : "#94a3b8"}
                      />
                    )}
                  </g>
                );
              })}

              {/* X Axis Labels (sparsed automatically for month view to prevent overlap) */}
              {points.map((pt, i) => {
                const shouldShow =
                  points.length <= 14 ||
                  i === 0 ||
                  i === points.length - 1 ||
                  i % Math.ceil(points.length / 8) === 0;

                if (!shouldShow) return null;

                return (
                  <text
                    key={pt.index}
                    x={pt.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="sans-serif"
                  >
                    {pt.date}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Recent Orders Table (5 Cols) with Real DB Data */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="font-bold text-sm text-gray-900">Recent Orders</h2>
              <p className="text-[11px] text-gray-400">Live database records</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#16a34a] hover:underline">
              View All ({data?.stats?.orders?.allTime || 0})
            </Link>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="pb-2.5 font-medium">Order ID</th>
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">Amount</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-400 text-xs">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  (data?.recentOrders || []).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-900 whitespace-nowrap">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-emerald-600">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-2.5 text-gray-600 whitespace-nowrap max-w-[110px] truncate" title={order.customer_name}>
                        {order.customer_name}
                      </td>
                      <td className="py-2.5 font-medium text-gray-900 whitespace-nowrap">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 items-start">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                              STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded ${
                              PAYMENT_BADGE[order.payment_status] || "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {order.payment_method === "COD" ? "COD" : "Prepaid"}: {order.payment_status || "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-gray-500 text-[11px] whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Selling Products + Orders by Status Donut + Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Top Selling Products */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="font-bold text-sm text-gray-900">Top Selling Products</h2>
              <p className="text-[11px] text-gray-400">Ranked by units sold in DB</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-[#16a34a] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pb-1.5 border-b border-gray-100">
              <span>Product</span>
              <div className="flex items-center gap-6">
                <span>Sold</span>
                <span>Revenue</span>
              </div>
            </div>

            {(data?.topProducts || []).length === 0 ? (
              <p className="py-6 text-center text-gray-400 text-xs">No products sold yet.</p>
            ) : (
              (data?.topProducts || []).slice(0, 5).map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 overflow-hidden border border-gray-200">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600">NX</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate text-[11.5px]">{prod.name}</p>
                      {prod.sku && <p className="text-[9.5px] text-gray-400 truncate">{prod.sku}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <span className="text-gray-500 font-medium text-[11.5px] w-8">{prod.sold}</span>
                    <span className="font-bold text-gray-900 text-[11.5px] w-16">
                      ₹{Number(prod.revenue).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Orders by Status Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-gray-900 mb-0.5">Orders by Status</h2>
            <p className="text-[11px] text-gray-400 mb-2">Real distribution of all orders</p>
          </div>

          <div className="flex items-center justify-center gap-4 my-auto py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 170 170" className="w-full h-full transform rotate-0">
                {donutData.total === 0 ? (
                  <circle
                    cx="85"
                    cy="85"
                    r="62"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="18"
                  />
                ) : (
                  donutData.slices.map((slice) => (
                    <path
                      key={slice.key}
                      d={slice.pathData}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="18"
                      strokeLinecap="butt"
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                    />
                  ))
                )}
              </svg>
              {/* Donut Center Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-base font-extrabold text-gray-900 leading-tight">
                  {Number(donutData.total).toLocaleString("en-IN")}
                </p>
                <p className="text-[9.5px] text-gray-400 font-medium">Total Orders</p>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 text-xs">
              {donutData.segments.map((seg) => (
                <div key={seg.key} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-2xs shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-gray-600 font-medium">{seg.label}</span>
                  <span className="text-gray-400 text-[10.5px]">({seg.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Customer Overview Widget */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="font-bold text-sm text-gray-900">Customer Overview</h2>
              <p className="text-[11px] text-gray-400">Database user activity</p>
            </div>
            <Link to="/admin/customers" className="text-xs font-semibold text-[#16a34a] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Total Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FiUser size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">Total Registered</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.total || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center">
                  <FiArrowUp size={10} />
                  {data?.customerOverview?.totalChange || 0}%
                </span>
              </div>
            </div>

            {/* New Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FiUserPlus size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">New (Last 30 Days)</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.newCustomers || 0).toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[10.5px] font-semibold flex items-center ${
                    (data?.customerOverview?.newChange || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {(data?.customerOverview?.newChange || 0) >= 0 ? (
                    <FiArrowUp size={10} />
                  ) : (
                    <FiArrowDown size={10} />
                  )}
                  {Math.abs(data?.customerOverview?.newChange || 0)}%
                </span>
              </div>
            </div>

            {/* Returning Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FiUsers size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">Repeat Buyers (&gt;1 Order)</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.returningCustomers || 0).toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[10.5px] font-semibold flex items-center ${
                    (data?.customerOverview?.returningChange || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {(data?.customerOverview?.returningChange || 0) >= 0 ? (
                    <FiArrowUp size={10} />
                  ) : (
                    <FiArrowDown size={10} />
                  )}
                  {Math.abs(data?.customerOverview?.returningChange || 0)}%
                </span>
              </div>
            </div>

            {/* Active Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                  <FiUserCheck size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">Active Buyers</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.activeCustomers || 0).toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[10.5px] font-semibold flex items-center ${
                    (data?.customerOverview?.activeChange || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {(data?.customerOverview?.activeChange || 0) >= 0 ? (
                    <FiArrowUp size={10} />
                  ) : (
                    <FiArrowDown size={10} />
                  )}
                  {Math.abs(data?.customerOverview?.activeChange || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}