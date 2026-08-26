import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiPackage,
  FiMapPin,
  FiLock,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiShoppingBag,
  FiExternalLink,
  FiCheck,
  FiShield,
} from "react-icons/fi";
import { TbTruckDelivery, TbShieldCheck } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://https://nutriexa-backend.onrender.com";

const STATUS_BADGES = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function UserProfile() {
  const { user, loginUser, logoutUser, isUserAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state
  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabParam);

  const token = localStorage.getItem("userToken");

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "Home",
    is_default: false,
  });
  const [addressMsg, setAddressMsg] = useState({ type: "", text: "" });

  // Security / Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // Sync tab with URL
  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch full profile info
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [token]);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch(`${API_BASE}/api/users/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    if (!token) return;
    setAddressesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "addresses") fetchAddresses();
  }, [activeTab]);

  // 1. Profile Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.message || "Failed to update profile." });
        return;
      }

      loginUser(data.user, data.token);
      setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: "Unable to connect to server." });
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Address Save / Update Handler
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressMsg({ type: "", text: "" });

    try {
      const url = editingAddressId
        ? `${API_BASE}/api/users/addresses/${editingAddressId}`
        : `${API_BASE}/api/users/addresses`;

      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddressMsg({ type: "error", text: data.message || "Failed to save address." });
        return;
      }

      setAddressModalOpen(false);
      setEditingAddressId(null);
      setAddressForm({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "Home",
        is_default: false,
      });
      fetchAddresses();
    } catch (err) {
      setAddressMsg({ type: "error", text: "Error saving address." });
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      address_type: addr.address_type || "Home",
      is_default: addr.is_default || false,
    });
    setAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      await fetch(`${API_BASE}/api/users/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await fetch(`${API_BASE}/api/users/addresses/${id}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Password Change Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (passwordForm.newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPassMsg({ type: "error", text: data.message || "Failed to update password." });
        return;
      }

      setPassMsg({ type: "success", text: "Your password has been changed successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassMsg({ type: "error", text: "Unable to connect to server." });
    } finally {
      setPassLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#f7f8f6]">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
            <FiUser size={30} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Please Log In</h1>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Log in to manage your Nutriexa profile, saved delivery addresses, and past orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="bg-[#4CAF37] text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#439e30] transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-gray-100 text-[#1a1a1a] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 min-h-[80vh]">
      
      {/* ── User Overview Hero Card ── */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d3748] rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#4CAF37] text-white font-extrabold text-2xl flex items-center justify-center shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || "Customer"}</h1>
              <span className="bg-[#4CAF37]/20 text-[#4CAF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#4CAF37]/40 uppercase tracking-wider">
                Verified Customer
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300 mt-1.5">
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <FiPhone size={12} className="text-[#4CAF37]" /> +91 {user.phone}
                </span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1">
                  <FiMail size={12} className="text-[#4CAF37]" /> {user.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 bg-[#4CAF37] hover:bg-[#439e30] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <FiShoppingBag size={14} /> Shop Store
          </Link>
          <button
            onClick={() => {
              logoutUser();
              navigate("/");
            }}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-red-300 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Layout: Sidebar Tabs + Content Panel ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm space-y-1">
            <button
              onClick={() => handleTabChange("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-[#4CAF37] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]"
              }`}
            >
              <FiUser size={16} /> My Profile
            </button>
            <button
              onClick={() => handleTabChange("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-[#4CAF37] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]"
              }`}
            >
              <FiPackage size={16} /> My Orders
            </button>
            <button
              onClick={() => handleTabChange("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "addresses"
                  ? "bg-[#4CAF37] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]"
              }`}
            >
              <FiMapPin size={16} /> Saved Addresses
            </button>
            <button
              onClick={() => handleTabChange("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "security"
                  ? "bg-[#4CAF37] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]"
              }`}
            >
              <FiLock size={16} /> Security & Password
            </button>
          </div>

          {/* Quick shortcuts widget */}
          <div className="bg-[#fafbf9] border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <p className="font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider text-[11px] text-gray-400">
              Quick Actions
            </p>
            <Link
              to="/authenticator"
              className="flex items-center gap-2 text-gray-600 hover:text-[#4CAF37] font-medium py-1"
            >
              <TbShieldCheck size={16} className="text-[#4CAF37]" /> Authenticity Check
            </Link>
            <Link
              to="/track-order"
              className="flex items-center gap-2 text-gray-600 hover:text-[#4CAF37] font-medium py-1"
            >
              <TbTruckDelivery size={16} className="text-[#4CAF37]" /> Live Order Tracking
            </Link>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-3">

          {/* ── TAB 1: PROFILE ── */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Personal Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage your personal identification details.</p>
              </div>

              {profileMsg.text && (
                <div
                  className={`text-xs font-medium rounded-lg p-3 mb-6 ${
                    profileMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">Mobile Number</label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full border border-gray-200 rounded-r-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#4CAF37] text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* ── TAB 2: MY ORDERS ── */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a]">My Orders</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Track your past purchases and shipment statuses.</p>
                </div>
                <Link
                  to="/products"
                  className="text-xs font-bold text-[#4CAF37] hover:underline"
                >
                  + Shop New Products
                </Link>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12 text-gray-400 text-xs">Loading your orders...</div>
              ) : ordersError ? (
                <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl">{ordersError}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <FiPackage size={24} />
                  </div>
                  <h3 className="font-bold text-[#1a1a1a] text-sm">No Orders Yet</h3>
                  <p className="text-xs text-gray-400 mt-1 mb-5">You haven't placed any orders with Nutriexa yet.</p>
                  <Link
                    to="/products"
                    className="bg-[#4CAF37] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#439e30]"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-3 mb-3">
                        <div>
                          <p className="text-xs font-bold text-[#1a1a1a]">Order #{order.id}</p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              STATUS_BADGES[order.order_status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.order_status || "Pending"}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                              order.payment_status === "Paid"
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.payment_method === "cod" ? "COD" : "Online"}: {order.payment_status || "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700">
                              <span className="font-semibold">{item.quantity}x</span> {item.product_name}
                            </span>
                            <span className="font-bold text-[#1a1a1a]">
                              ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
                        <span className="font-semibold text-gray-500">
                          Total: <strong className="text-[#1a1a1a] text-sm">₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                        </span>
                        <Link
                          to={`/track-order?order=${order.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[#4CAF37] hover:underline"
                        >
                          <TbTruckDelivery size={14} /> Track Order <FiExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: SAVED ADDRESSES ── */}
          {activeTab === "addresses" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a]">Saved Addresses</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage multiple shipping destinations for fast checkout.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      name: user?.name || "",
                      phone: user?.phone || "",
                      address_line1: "",
                      address_line2: "",
                      city: "",
                      state: "",
                      pincode: "",
                      address_type: "Home",
                      is_default: false,
                    });
                    setAddressModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#4CAF37] text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#439e30] transition-colors"
                >
                  <FiPlus size={14} /> Add New Address
                </button>
              </div>

              {addressesLoading ? (
                <div className="text-center py-12 text-gray-400 text-xs">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <FiMapPin size={24} />
                  </div>
                  <h3 className="font-bold text-[#1a1a1a] text-sm">No Saved Addresses</h3>
                  <p className="text-xs text-gray-400 mt-1 mb-5">Save your delivery locations to speed up your checkout process.</p>
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        address_line1: "",
                        address_line2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        address_type: "Home",
                        is_default: true,
                      });
                      setAddressModalOpen(true);
                    }}
                    className="bg-[#4CAF37] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#439e30]"
                  >
                    + Add First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between relative ${
                        addr.is_default
                          ? "border-[#4CAF37] bg-[#f7fbf6]"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {addr.address_type || "Home"}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold text-[#4CAF37] flex items-center gap-1 bg-[#4CAF37]/10 px-2 py-0.5 rounded-full">
                              <FiCheck size={11} /> Default
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-[#1a1a1a]">{addr.name}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                          <br />
                          {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          📞 +91 {addr.phone}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[#4CAF37] font-semibold hover:underline text-[11px]"
                          >
                            Set as default
                          </button>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="text-gray-500 hover:text-[#4CAF37]"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: SECURITY & PASSWORD ── */}
          {activeTab === "security" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Change Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Ensure your account uses a strong, private password.</p>
              </div>

              {passMsg.text && (
                <div
                  className={`text-xs font-medium rounded-lg p-3 mb-6 ${
                    passMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
                    >
                      {showCurrentPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
                    >
                      {showNewPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Re-enter new password"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="bg-[#4CAF37] text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm mt-2"
                >
                  {passLoading ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ── Address Add / Edit Modal ── */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="font-bold text-[#1a1a1a] text-lg">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="text-gray-400 hover:text-[#1a1a1a] text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {addressMsg.text && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">
                {addressMsg.text}
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    placeholder="Recipient's Name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Phone Number *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    required
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Address (House / Flat / Street) *</label>
                <input
                  type="text"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  required
                  placeholder="e.g. Flat 402, Greenfield Apartments"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Area / Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                  placeholder="e.g. Near Metro Station"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    placeholder="City"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">State *</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    placeholder="State"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Pincode *</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    required
                    placeholder="6 digits"
                    maxLength={6}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-xs">
                  <label className="font-semibold text-gray-700">Type:</label>
                  {["Home", "Office", "Other"].map((t) => (
                    <label key={t} className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="address_type"
                        value={t}
                        checked={addressForm.address_type === t}
                        onChange={() => setAddressForm({ ...addressForm, address_type: t })}
                        className="text-[#4CAF37] focus:ring-[#4CAF37]"
                      />
                      {t}
                    </label>
                  ))}
                </div>

                <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="text-[#4CAF37] rounded focus:ring-[#4CAF37]"
                  />
                  Set as Default
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4CAF37] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#439e30]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
