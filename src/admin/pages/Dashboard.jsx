import { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { API_URL as API_BASE } from "../../config";

const STATUS_STYLES = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const { stats, recentOrders, topProducts } = data;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${Number(stats.revenue.value).toLocaleString("en-IN")}`,
      change: `${stats.revenue.change > 0 ? "+" : ""}${stats.revenue.change}%`,
      up: stats.revenue.change >= 0,
      icon: <FiDollarSign size={20} />,
    },
    {
      label: "Total Orders",
      value: stats.orders.value.toLocaleString("en-IN"),
      change: `${stats.orders.change > 0 ? "+" : ""}${stats.orders.change}%`,
      up: stats.orders.change >= 0,
      icon: <FiShoppingBag size={20} />,
    },
    {
      label: "Total Customers",
      value: stats.customers.value.toLocaleString("en-IN"),
      change: `${stats.customers.change > 0 ? "+" : ""}${stats.customers.change}%`,
      up: stats.customers.change >= 0,
      icon: <FiUsers size={20} />,
    },
    {
      label: "Products Listed",
      value: stats.products.value.toLocaleString("en-IN"),
      change: null,
      up: true,
      icon: <FiBox size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, here's what's happening with your store today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#4CAF37]/10 text-[#4CAF37] flex items-center justify-center">
                {stat.icon}
              </div>
              {stat.change && (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    stat.up ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {stat.up ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-xl font-extrabold text-[#1a1a1a]">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1a1a1a]">Recent Orders</h2>
            <button className="text-xs font-semibold text-[#4CAF37] hover:underline">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.order_number}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 font-medium text-[#1a1a1a]">
                        {order.order_number}
                      </td>
                      <td className="py-3 text-gray-600">{order.customer_name}</td>
                      <td className="py-3 text-gray-600">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-[#1a1a1a] mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400">No sales data yet.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-md bg-[#f3f6f2] text-[#4CAF37] font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">{p.sold} sold</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a1a] shrink-0">
                    ₹{Number(p.revenue).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}