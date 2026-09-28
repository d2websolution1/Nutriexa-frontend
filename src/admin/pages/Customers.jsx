import { useEffect, useState, useCallback } from "react";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiX,
  FiEye,
  FiDollarSign,
  FiPackage,
  FiAlertTriangle,
  FiRefreshCw,
  FiUser,
  FiCheck,
  FiFilter,
  FiTrash2,
  FiEdit2,
  FiMoreVertical,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";

const API_CUSTOMERS = `${BASE_URL}/api/admin/customers`;

const STATUS_BADGE = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200/60",
  Processing: "bg-amber-50 text-amber-700 border-amber-200/60",
  Pending: "bg-orange-50 text-orange-700 border-orange-200/60",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
};

const PAYMENT_BADGE = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  Failed: "bg-rose-50 text-rose-700 border-rose-200/60",
};

function formatDateTime(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatDate(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "with_orders" | "no_orders" | "verified" | "pending"
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer Detail Drawer/Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Edit Customer Modal states
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", is_verified: false });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(API_CUSTOMERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to fetch customers (Status ${res.status})`);
      }

      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError(err.message || "Failed to load customers. Please check backend server connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch full details and real order history of clicked customer
  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    setDetailError("");
    setCustomerDetail(null);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_CUSTOMERS}/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to load customer order details.");
      }

      const data = await res.json();
      setCustomerDetail(data);
    } catch (err) {
      console.error("Error loading customer detail:", err);
      setDetailError(err.message || "Could not retrieve customer order history.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCustomer(null);
    setCustomerDetail(null);
  };

  // Open Edit Customer Modal
  const openEditModal = (customer, e) => {
    if (e) e.stopPropagation();
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      is_verified: Boolean(customer.is_verified),
    });
  };

  // Save Customer Edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setEditSubmitting(true);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_CUSTOMERS}/${editingCustomer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update customer details.");
      }

      const { customer: updated } = await res.json();

      // Update in state
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...updated } : c))
      );

      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer((prev) => ({ ...prev, ...updated }));
        if (customerDetail) {
          setCustomerDetail((prev) => ({
            ...prev,
            customer: { ...prev.customer, ...updated },
          }));
        }
      }

      setEditingCustomer(null);
      alert("Customer details updated successfully.");
    } catch (err) {
      alert("Edit Error: " + err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle Verification directly
  const handleToggleVerification = async (customer, e) => {
    if (e) e.stopPropagation();
    const newStatus = !customer.is_verified;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_CUSTOMERS}/${customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_verified: newStatus }),
      });

      if (!res.ok) throw new Error("Could not update verification status.");

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, is_verified: newStatus } : c))
      );

      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer((prev) => ({ ...prev, is_verified: newStatus }));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (customer, e) => {
    if (e) e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete customer "${customer.name || customer.email}"? \n\nThis will remove their account from the database.`
    );
    if (!confirmed) return;

    setDeletingId(customer.id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_CUSTOMERS}/${customer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to delete customer.");
      }

      // Remove from table state
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));

      if (selectedCustomer && selectedCustomer.id === customer.id) {
        closeDetail();
      }

      alert(`Customer "${customer.name || customer.email}" has been deleted.`);
    } catch (err) {
      alert("Delete Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered customer list
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "with_orders") return Number(c.total_orders || 0) > 0;
    if (statusFilter === "no_orders") return Number(c.total_orders || 0) === 0;
    if (statusFilter === "verified") return Boolean(c.is_verified);
    if (statusFilter === "pending") return !c.is_verified;

    return true;
  });

  // Calculate overview metrics
  const totalCustomers = customers.length;
  const verifiedCount = customers.filter((c) => c.is_verified).length;
  const pendingCount = customers.filter((c) => !c.is_verified).length;
  const withOrdersCount = customers.filter((c) => Number(c.total_orders || 0) > 0).length;
  const totalCustomerRevenue = customers.reduce(
    (sum, c) => sum + Number(c.total_spent || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">Customers Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage customer accounts, verify emails, edit details, and delete pending or test IDs.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-[#22c55e] text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin text-[#22c55e]" : ""} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Top 4 KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <FiUser size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">Total Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <FiUserX size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">Pending / Unverified</p>
            <p className="text-xl font-bold text-amber-600 leading-tight">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <FiShoppingBag size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">Active Buyers</p>
            <p className="text-xl font-bold text-blue-600 leading-tight">{withOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold shrink-0">
            <FiDollarSign size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">Total Lifetime Revenue</p>
            <p className="text-xl font-bold text-green-600 leading-tight">
              ₹{totalCustomerRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container: Search, Filter Tabs & Table */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
              <FiFilter size={13} className="text-[#22c55e]" /> Filter:
            </span>
            {[
              { key: "all", label: "All Customers" },
              { key: "pending", label: `Pending Verification (${pendingCount})` },
              { key: "verified", label: `Verified (${verifiedCount})` },
              { key: "with_orders", label: `With Orders (${withOrdersCount})` },
              { key: "no_orders", label: "No Orders Yet" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#22c55e] text-white shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 w-full sm:w-72 border border-gray-200/50 dark:border-white/10">
            <FiSearch className="text-gray-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                <th className="px-4 py-3.5 font-semibold">Customer</th>
                <th className="px-4 py-3.5 font-semibold">Account Status</th>
                <th className="px-4 py-3.5 font-semibold">Total Orders</th>
                <th className="px-4 py-3.5 font-semibold">Total Spent</th>
                <th className="px-4 py-3.5 font-semibold">Joined Date</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    Loading customer records from database...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-rose-500 text-xs font-semibold">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const ordersNum = Number(c.total_orders || 0);
                  const spentNum = Number(c.total_spent || 0);
                  const isDeleting = deletingId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openCustomerDetail(c)}
                      className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors cursor-pointer group"
                      title="Click to view complete customer profile and order history"
                    >
                      {/* Customer info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#22c55e]/20 to-[#22c55e]/10 text-[#2e7d32] font-extrabold flex items-center justify-center text-sm shrink-0 border border-[#22c55e]/30 group-hover:scale-105 transition-transform">
                            {c.name ? c.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#22c55e] transition-colors">
                              {c.name || "Anonymous User"}
                            </p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <FiMail size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </p>
                            {c.phone && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                <FiPhone size={10} className="shrink-0" />
                                <span>{c.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Verification Status with quick toggle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleVerification(c, e)}
                          title="Click to toggle Verified / Pending status"
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            c.is_verified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {c.is_verified ? (
                            <>
                              <FiCheck size={11} /> Verified
                            </>
                          ) : (
                            <>
                              <FiClock size={11} /> Pending
                            </>
                          )}
                        </button>
                      </td>

                      {/* Total Orders */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              ordersNum > 0
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {ordersNum} {ordersNum === 1 ? "Order" : "Orders"}
                          </span>
                          {ordersNum > 0 && Number(c.pending_orders) > 0 && (
                            <span className="text-[10.5px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              {c.pending_orders} active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                        {spentNum > 0 ? (
                          <span className="text-[#2e7d32]">₹{spentNum.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">₹0.00</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Action Buttons: View, Edit, Delete */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* View Orders button */}
                          <button
                            onClick={() => openCustomerDetail(c)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                            title="View Orders History"
                          >
                            <FiEye size={14} />
                          </button>

                          {/* Edit Details button */}
                          <button
                            onClick={(e) => openEditModal(c, e)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer"
                            title="Edit Customer Details"
                          >
                            <FiEdit2 size={14} />
                          </button>

                          {/* Delete Customer button */}
                          <button
                            onClick={(e) => handleDeleteCustomer(c, e)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                            title={!c.is_verified ? "Delete Pending / Unverified ID" : "Delete Customer"}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          EDIT CUSTOMER MODAL
         ========================================================================= */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 p-6 space-y-4 relative">
            <button
              onClick={() => setEditingCustomer(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold">
                <FiEdit2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit Customer Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Update profile info or account verification status</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Verification Status</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="is_verified"
                      checked={editForm.is_verified === true}
                      onChange={() => setEditForm({ ...editForm, is_verified: true })}
                      className="text-[#22c55e] focus:ring-[#22c55e]"
                    />
                    <span>Verified</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="is_verified"
                      checked={editForm.is_verified === false}
                      onChange={() => setEditForm({ ...editForm, is_verified: false })}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>Pending</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOMER ORDERS & PROFILE DETAILS MODAL / DRAWER
         ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#22c55e] to-[#16a34a] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
                      {selectedCustomer.name || "Customer Profile"}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedCustomer.is_verified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {selectedCustomer.is_verified ? "Verified Customer" : "Pending Verification"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FiMail size={12} className="text-gray-400" />
                      {selectedCustomer.email}
                    </span>
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1">
                        <FiPhone size={12} className="text-gray-400" />
                        {selectedCustomer.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiCalendar size={12} className="text-gray-400" />
                      Member since {formatDate(selectedCustomer.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Edit Customer"
                >
                  <FiEdit2 size={16} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Customer Account"
                >
                  <FiTrash2 size={16} />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-gray-500">
                    Retrieving real database orders for {selectedCustomer.name}...
                  </p>
                </div>
              ) : detailError ? (
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                  <FiAlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-rose-700">{detailError}</p>
                </div>
              ) : customerDetail ? (
                <>
                  {/* Summary Metric Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center">
                      <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                        {customerDetail.metrics?.total_orders || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center">
                      <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                      <p className="text-lg font-bold text-[#2e7d32] mt-0.5">
                        ₹{Number(customerDetail.metrics?.total_spent || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center">
                      <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">Delivered Orders</p>
                      <p className="text-lg font-bold text-emerald-600 mt-0.5">
                        {customerDetail.metrics?.delivered_orders || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center">
                      <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">Pending / In-Transit</p>
                      <p className="text-lg font-bold text-amber-600 mt-0.5">
                        {(customerDetail.metrics?.pending_orders || 0) + (customerDetail.metrics?.shipped_orders || 0)}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center col-span-2 sm:col-span-1">
                      <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">Average Order Value</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                        ₹{Number(customerDetail.metrics?.avg_order_value || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Orders List Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiShoppingBag size={16} className="text-[#22c55e]" />
                        <span>All Customer Orders ({customerDetail.orders?.length || 0})</span>
                      </h3>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Real-time orders synced from PostgreSQL database
                      </span>
                    </div>

                    {(!customerDetail.orders || customerDetail.orders.length === 0) ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                          <FiPackage size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">No Orders Placed Yet</h4>
                          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                            This customer has registered an account but has not completed any purchases yet.
                          </p>
                        </div>
                        {!selectedCustomer.is_verified && (
                          <button
                            onClick={() => handleDeleteCustomer(selectedCustomer)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={13} />
                            <span>Delete Pending Account</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerDetail.orders.map((order) => {
                          const items = Array.isArray(order.items) ? order.items : [];
                          return (
                            <div
                              key={order.id}
                              className="border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/20 transition-all shadow-2xs space-y-4"
                            >
                              {/* Order Card Top Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold shrink-0">
                                    <FiPackage size={18} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                                        {order.order_number}
                                      </p>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                          STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {order.status}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                                      <FiClock size={11} />
                                      {formatDateTime(order.created_at)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                                  {/* Payment status badge */}
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                      PAYMENT_BADGE[order.payment_status] || "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    Payment: {order.payment_status || "Pending"}
                                  </span>
                                  {/* Payment method */}
                                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                    {order.payment_method || "COD"}
                                  </span>
                                  {/* Order Total */}
                                  <span className="font-extrabold text-sm text-gray-900 bg-emerald-50 text-[#2e7d32] px-3 py-1 rounded-lg border border-emerald-200/50">
                                    ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>

                              {/* Order Details: Items Table + Delivery Info */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Ordered Products Table (8 Cols) */}
                                <div className="md:col-span-8 bg-gray-50/60 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10">
                                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Ordered Items ({items.length})
                                  </p>
                                  {items.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No item rows recorded.</p>
                                  ) : (
                                    <div className="divide-y divide-gray-100">
                                      {items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="py-2 flex items-center justify-between gap-3 text-xs"
                                        >
                                          <div className="min-w-0">
                                            <p className="font-bold text-gray-800 dark:text-gray-200 truncate">
                                              {item.product_name}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                              Qty: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.quantity}</span> &times; ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                            </p>
                                          </div>
                                          <p className="font-bold text-gray-900 dark:text-white shrink-0">
                                            ₹{(Number(item.quantity || 1) * Number(item.price || 0)).toLocaleString("en-IN")}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Shipping / Delivery Info (4 Cols) */}
                                <div className="md:col-span-4 bg-gray-50/60 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 text-xs space-y-1.5">
                                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <FiTruck size={12} className="text-[#22c55e]" /> Delivery Address
                                  </p>
                                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {order.shipping_address || "Address not provided"}
                                  </p>
                                  {(order.shipping_city || order.shipping_state || order.shipping_pincode) && (
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                                      {[order.shipping_city, order.shipping_state, order.shipping_pincode]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                  )}
                                  {order.shipping_phone && (
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-white/10">
                                      <FiPhone size={10} className="text-gray-400" />
                                      <span>Phone: {order.shipping_phone}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Customer ID: #{selectedCustomer.id}
              </span>
              <button
                onClick={closeDetail}
                className="px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}