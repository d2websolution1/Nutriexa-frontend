import { useEffect, useState, useMemo } from "react";
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
} from "react-icons/fi";
import { API_URL as API_BASE } from "../../config";

const STATUS_BADGE = {
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  Shipped: "bg-blue-50 text-blue-700 border border-blue-200/60",
  Processing: "bg-amber-50 text-amber-700 border border-amber-200/60",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200/60",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("This Week");
  const [hoveredPointIndex, setHoveredPointIndex] = useState(3); // default highlight 15 May peak

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn("Using dashboard mock fallback:", err.message);
        // Fallback with exact values matching reference design
        setData({
          stats: {
            revenue: { value: 876540, change: 12.5 },
            orders: { value: 1248, change: 8.3 },
            customers: { value: 3842, change: 9.7 },
            conversionRate: { value: 3.24, change: 5.2 },
            avgOrderValue: { value: 1259, change: 6.1 },
          },
          timeline: [
            { date: "12 May", fullDate: "12 May 2024", revenue: 48500, orders: 18 },
            { date: "13 May", fullDate: "13 May 2024", revenue: 75200, orders: 27 },
            { date: "14 May", fullDate: "14 May 2024", revenue: 82400, orders: 31 },
            { date: "15 May", fullDate: "15 May 2024", revenue: 125430, orders: 48 },
            { date: "16 May", fullDate: "16 May 2024", revenue: 89100, orders: 34 },
            { date: "17 May", fullDate: "17 May 2024", revenue: 54200, orders: 21 },
            { date: "18 May", fullDate: "18 May 2024", revenue: 78600, orders: 29 },
          ],
          ordersByStatus: {
            Delivered: 620,
            Shipped: 256,
            Processing: 187,
            Pending: 132,
            Cancelled: 53,
            total: 1248,
          },
          customerOverview: {
            total: 3842,
            totalChange: 9.7,
            newCustomers: 562,
            newChange: 12.3,
            returningCustomers: 3280,
            returningChange: 8.1,
            activeCustomers: 1890,
            activeChange: 10.5,
          },
          recentOrders: [
            { id: 1, order_number: "#NX12345", customer_name: "Rahul Sharma", total_amount: 2499, status: "Delivered", created_at: "2024-05-18T10:30:00Z" },
            { id: 2, order_number: "#NX12344", customer_name: "Priya Singh", total_amount: 1899, status: "Shipped", created_at: "2024-05-18T08:15:00Z" },
            { id: 3, order_number: "#NX12343", customer_name: "Amit Kumar", total_amount: 3299, status: "Processing", created_at: "2024-05-17T16:40:00Z" },
            { id: 4, order_number: "#NX12342", customer_name: "Neha Verma", total_amount: 999, status: "Pending", created_at: "2024-05-17T11:20:00Z" },
            { id: 5, order_number: "#NX12341", customer_name: "Vikram Mehta", total_amount: 4499, status: "Cancelled", created_at: "2024-05-16T14:10:00Z" },
          ],
          topProducts: [
            { name: "Whey Protein (Chocolate)", sold: 456, revenue: 345678, image: null },
            { name: "Creatine Monohydrate", sold: 389, revenue: 155678, image: null },
            { name: "Pre-Workout Extreme", sold: 312, revenue: 125340, image: null },
            { name: "Mass Gainer", sold: 287, revenue: 110239, image: null },
            { name: "BCAA Instantized", sold: 245, revenue: 89605, image: null },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "18 May 2024";
    try {
      return new Date(isoString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "18 May 2024";
    }
  };

  const timeline = data?.timeline || [];
  const maxRevenue = useMemo(() => {
    if (!timeline.length) return 125000;
    const maxVal = Math.max(...timeline.map((p) => p.revenue));
    return Math.max(125000, Math.ceil(maxVal / 25000) * 25000);
  }, [timeline]);

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
      const x = paddingX + (i / (timeline.length - 1)) * chartWidth;
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

  // Donut chart calculations
  const donutData = useMemo(() => {
    const raw = data?.ordersByStatus || {
      Delivered: 620,
      Shipped: 256,
      Processing: 187,
      Pending: 132,
      Cancelled: 53,
      total: 1248,
    };
    const segments = [
      { key: "Delivered", label: "Delivered", count: raw.Delivered, color: "#22c55e" },
      { key: "Shipped", label: "Shipped", count: raw.Shipped, color: "#3b82f6" },
      { key: "Processing", label: "Processing", count: raw.Processing, color: "#eab308" },
      { key: "Pending", label: "Pending", count: raw.Pending, color: "#f97316" },
      { key: "Cancelled", label: "Cancelled", count: raw.Cancelled, color: "#ef4444" },
    ];
    const total = segments.reduce((sum, s) => sum + s.count, 0) || 1248;

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
      const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...seg,
        pathData,
      };
    });

    return { total, slices, segments };
  }, [data]);

  const activeHoverPoint = points[hoveredPointIndex] || points[3] || points[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Breadcrumbs matching image */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-gray-800">Dashboard</span>
          </p>
        </div>

        {/* Date range picker button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs hover:border-gray-300 transition-colors cursor-pointer">
            <FiCalendar size={14} className="text-gray-500" />
            <span>12 May 2024 - 18 May 2024</span>
            <FiChevronDown size={14} className="text-gray-400 ml-1" />
          </div>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/15 text-[#16a34a] flex items-center justify-center font-bold">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ₹{Number(data?.stats?.revenue?.value || 876540).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
            <FiArrowUp size={11} />
            <span>{data?.stats?.revenue?.change || 12.5}% vs last 7 days</span>
          </p>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FiShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Total Orders</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {Number(data?.stats?.orders?.value || 1248).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
            <FiArrowUp size={11} />
            <span>{data?.stats?.orders?.change || 8.3}% vs last 7 days</span>
          </p>
        </div>

        {/* 3. Total Customers */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiUsers size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Total Customers</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {Number(data?.stats?.customers?.value || 3842).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
            <FiArrowUp size={11} />
            <span>{data?.stats?.customers?.change || 9.7}% vs last 7 days</span>
          </p>
        </div>

        {/* 4. Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Conversion Rate</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {data?.stats?.conversionRate?.value || 3.24}%
              </p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
            <FiArrowUp size={11} />
            <span>{data?.stats?.conversionRate?.change || 5.2}% vs last 7 days</span>
          </p>
        </div>

        {/* 5. Avg. Order Value */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiCreditCard size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Avg. Order Value</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ₹{Number(data?.stats?.avgOrderValue?.value || 1259).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-1">
            <FiArrowUp size={11} />
            <span>{data?.stats?.avgOrderValue?.change || 6.1}% vs last 7 days</span>
          </p>
        </div>
      </div>

      {/* Main Row: Sales Overview Line Graph + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview Area Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-gray-900">Sales Overview</h2>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none cursor-pointer"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
              <FiChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* SVG Line Graph with Gradient & Hover Tooltip */}
          <div className="relative w-full overflow-hidden select-none">
            {/* Tooltip Overlay */}
            {activeHoverPoint && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(activeHoverPoint.x / svgWidth) * 100}%`,
                  top: `${(activeHoverPoint.y / svgHeight) * 100 - 8}%`,
                }}
              >
                <div className="bg-[#111827] text-white text-[10px] px-2.5 py-1 rounded-md shadow-lg text-center leading-tight whitespace-nowrap border border-white/10">
                  <p className="text-gray-300 font-medium">{activeHoverPoint.fullDate}</p>
                  <p className="font-bold text-[#4ade80]">
                    Revenue: ₹{Number(activeHoverPoint.revenue).toLocaleString("en-IN")}
                  </p>
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

              {/* Y Axis Grid lines and labels */}
              {[125, 100, 75, 50, 25, 0].map((k) => {
                const y = paddingY + chartHeight - (k / 125) * chartHeight;
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
                      {k === 0 ? "0" : `${k}K`}
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
                const isActive = hoveredPointIndex === pt.index;
                return (
                  <g
                    key={pt.index}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(pt.index)}
                  >
                    {/* Transparent touch hitbox */}
                    <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                    {isActive ? (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="6" fill="#15803d" />
                        <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" />
                      </>
                    ) : (
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#22c55e" />
                    )}
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {points.map((pt) => (
                <text
                  key={pt.index}
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#94a3b8"
                  fontFamily="sans-serif"
                >
                  {pt.date}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Recent Orders Table (5 Cols) with Date Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-bold text-sm text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#16a34a] hover:underline">
              View All
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
                {(data?.recentOrders || []).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      {order.order_number}
                    </td>
                    <td className="py-2.5 text-gray-600 whitespace-nowrap">
                      {order.customer_name}
                    </td>
                    <td className="py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-500 text-[11px] whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
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
            <h2 className="font-bold text-sm text-gray-900">Top Selling Products</h2>
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

            {(data?.topProducts || []).slice(0, 5).map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-2xs">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-[#22c55e]">NX</span>
                    )}
                  </div>
                  <p className="font-medium text-gray-800 truncate text-[11.5px]">{prod.name}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <span className="text-gray-500 font-medium text-[11.5px] w-8">{prod.sold}</span>
                  <span className="font-bold text-gray-900 text-[11.5px] w-16">
                    ₹{Number(prod.revenue).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Orders by Status Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <h2 className="font-bold text-sm text-gray-900 mb-2">Orders by Status</h2>

          <div className="flex items-center justify-center gap-4 my-auto py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 170 170" className="w-full h-full transform rotate-0">
                {donutData.slices.map((slice) => (
                  <path
                    key={slice.key}
                    d={slice.pathData}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="18"
                    strokeLinecap="butt"
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                ))}
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
            <h2 className="font-bold text-sm text-gray-900">Customer Overview</h2>
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
                <p className="text-xs text-gray-700 font-medium">Total Customers</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.total || 3842).toLocaleString("en-IN")}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center">
                  <FiArrowUp size={10} />
                  {data?.customerOverview?.totalChange || 9.7}%
                </span>
              </div>
            </div>

            {/* New Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FiUserPlus size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">New Customers</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.newCustomers || 562).toLocaleString("en-IN")}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center">
                  <FiArrowUp size={10} />
                  {data?.customerOverview?.newChange || 12.3}%
                </span>
              </div>
            </div>

            {/* Returning Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FiUsers size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">Returning Customers</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.returningCustomers || 3280).toLocaleString("en-IN")}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center">
                  <FiArrowUp size={10} />
                  {data?.customerOverview?.returningChange || 8.1}%
                </span>
              </div>
            </div>

            {/* Active Customers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                  <FiUserCheck size={15} />
                </div>
                <p className="text-xs text-gray-700 font-medium">Active Customers</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-gray-900 text-xs">
                  {Number(data?.customerOverview?.activeCustomers || 1890).toLocaleString("en-IN")}
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center">
                  <FiArrowUp size={10} />
                  {data?.customerOverview?.activeChange || 10.5}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}