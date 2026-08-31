import { useEffect, useState, useCallback } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
  FiShield,
  FiKey,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiUserCheck,
  FiUserX,
  FiCheckCircle,
  FiSliders,
} from "react-icons/fi";
import { API_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

const ROLE_BADGE_STYLES = {
  "Super Admin": "bg-purple-100 text-purple-700 border-purple-200",
  "Store Manager": "bg-blue-100 text-blue-700 border-blue-200",
  "Inventory Manager": "bg-amber-100 text-amber-800 border-amber-200",
  "Order Processor": "bg-teal-100 text-teal-700 border-teal-200",
  "Customer Support": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Custom Staff": "bg-gray-100 text-gray-700 border-gray-200",
  Staff: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function StaffManagement() {
  const { admin: currentAdmin, hasPermission } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    deactivatedStaff: 0,
    superAdmins: 0,
  });
  const [rolesMeta, setRolesMeta] = useState({
    roles: [],
    permissionsCatalog: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Store Manager",
    permissions: [],
    is_active: true,
  });
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const getToken = () => localStorage.getItem("adminToken");

  // 1. Fetch Staff and Meta
  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();

      const [staffRes, metaRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/staff/roles-meta`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!staffRes.ok) {
        throw new Error("Failed to load staff accounts.");
      }

      const staffData = await staffRes.json();
      const metaData = metaRes.ok ? await metaRes.json() : { roles: [], permissionsCatalog: [] };

      setStaffList(staffData.staff || []);
      setStats(staffData.stats || { totalStaff: 0, activeStaff: 0, deactivatedStaff: 0, superAdmins: 0 });
      setRolesMeta(metaData);
    } catch (err) {
      console.error("Staff loading error:", err);
      setError(err.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Handle Preset Role Selection in Form -> auto sets permissions
  const handleRoleChange = (newRole) => {
    const preset = rolesMeta.roles.find((r) => r.name === newRole);
    let newPerms = [];

    if (preset) {
      newPerms = [...preset.permissions];
    }

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: newPerms,
    }));
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (permKey) => {
    setFormData((prev) => {
      let currentPerms = [...prev.permissions];
      if (currentPerms.includes("*")) {
        // If wildcard was set and unchecking a specific one, expand to all except this one
        const allKeys = rolesMeta.permissionsCatalog.flatMap((cat) => cat.permissions.map((p) => p.key));
        currentPerms = allKeys.filter((k) => k !== permKey);
      } else if (currentPerms.includes(permKey)) {
        currentPerms = currentPerms.filter((k) => k !== permKey);
      } else {
        currentPerms.push(permKey);
      }
      return {
        ...prev,
        permissions: currentPerms,
        role: prev.role === "Super Admin" ? "Custom Staff" : prev.role,
      };
    });
  };

  // Toggle category all / clear
  const handleToggleCategory = (categoryPermissions) => {
    const catKeys = categoryPermissions.map((p) => p.key);
    const allSelected = catKeys.every((k) => formData.permissions.includes(k) || formData.permissions.includes("*"));

    setFormData((prev) => {
      let currentPerms = prev.permissions.includes("*")
        ? rolesMeta.permissionsCatalog.flatMap((c) => c.permissions.map((p) => p.key))
        : [...prev.permissions];

      if (allSelected) {
        currentPerms = currentPerms.filter((k) => !catKeys.includes(k));
      } else {
        const set = new Set([...currentPerms, ...catKeys]);
        currentPerms = Array.from(set);
      }

      return {
        ...prev,
        permissions: currentPerms,
      };
    });
  };

  // Select all permissions
  const handleSelectAllPermissions = () => {
    const allKeys = rolesMeta.permissionsCatalog.flatMap((c) => c.permissions.map((p) => p.key));
    setFormData((prev) => ({
      ...prev,
      permissions: allKeys,
    }));
  };

  // Clear all permissions
  const handleClearAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  // Open Add Modal
  const openAddModal = () => {
    const defaultRole = "Store Manager";
    const preset = rolesMeta.roles.find((r) => r.name === defaultRole);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: defaultRole,
      permissions: preset ? [...preset.permissions] : [],
      is_active: true,
    });
    setFormError("");
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      password: "",
      role: staff.role || "Custom Staff",
      permissions: Array.isArray(staff.permissions) ? staff.permissions : [],
      is_active: staff.is_active !== false,
    });
    setFormError("");
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  // Open Details Modal
  const openDetailModal = (staff) => {
    setSelectedStaff(staff);
    setIsDetailModalOpen(true);
  };

  // Submit Create Staff
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setFormSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create staff member.");
      }

      setIsAddModalOpen(false);
      fetchStaffData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Staff
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    setFormSubmitting(true);
    try {
      const token = getToken();
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        is_active: formData.is_active,
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await fetch(`${API_URL}/api/admin/staff/${selectedStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update staff member.");
      }

      setIsEditModalOpen(false);
      fetchStaffData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (staff) => {
    const newStatus = !(staff.is_active !== false);
    setTogglingId(staff.id);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/staff/${staff.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, is_active: newStatus } : s))
      );
      setStats((prev) => ({
        ...prev,
        activeStaff: newStatus ? prev.activeStaff + 1 : prev.activeStaff - 1,
        deactivatedStaff: newStatus ? prev.deactivatedStaff - 1 : prev.deactivatedStaff + 1,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff member "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete staff member.");
      }

      fetchStaffData();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));

    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && s.is_active !== false) ||
      (statusFilter === "Deactivated" && s.is_active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const canCreate = hasPermission("staff.create");
  const canEdit = hasPermission("staff.edit");
  const canDelete = hasPermission("staff.delete");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#4CAF37]/10 text-[#4CAF37] rounded-lg">
              <FiUsers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Staff & Permissions</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage your administrative team, assign roles, and configure granular module permissions.
              </p>
            </div>
          </div>
        </div>

        {canCreate && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <FiUserPlus size={17} /> Add Staff Member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Staff</p>
            <p className="text-xl font-extrabold text-[#1a1a1a]">{stats.totalStaff}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <FiUserCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Members</p>
            <p className="text-xl font-extrabold text-green-600">{stats.activeStaff}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <FiUserX size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Deactivated</p>
            <p className="text-xl font-extrabold text-red-600">{stats.deactivatedStaff}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FiShield size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Super Admins</p>
            <p className="text-xl font-extrabold text-purple-700">{stats.superAdmins}</p>
          </div>
        </div>
      </div>

      {/* Main Staff Table Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-[#fafbf9]">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full md:w-80 shadow-xs">
            <FiSearch className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="bg-transparent text-xs sm:text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#4CAF37] cursor-pointer"
            >
              <option value="All">All Roles</option>
              {rolesMeta.roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#4CAF37] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Deactivated">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-[#f7f8f6]">
                <th className="px-4 py-3.5 font-semibold">Staff Member</th>
                <th className="px-4 py-3.5 font-semibold">Role</th>
                <th className="px-4 py-3.5 font-semibold">Permissions</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Created</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4CAF37] border-t-transparent mb-2" />
                    <p>Loading staff members...</p>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No staff members match the current search or filters.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredStaff.map((staff) => {
                  const isSelf = currentAdmin && Number(currentAdmin.id) === Number(staff.id);
                  const isSuper = staff.role === "Super Admin";
                  const perms = Array.isArray(staff.permissions) ? staff.permissions : [];
                  const isWildcard = perms.includes("*") || isSuper;

                  return (
                    <tr key={staff.id} className="hover:bg-[#fafbf9] transition-colors">
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#4CAF37]/10 text-[#4CAF37] font-bold flex items-center justify-center text-sm uppercase shrink-0 border border-[#4CAF37]/20">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#1a1a1a]">{staff.name}</p>
                              {isSelf && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <FiMail size={11} /> {staff.email}
                              </span>
                              {staff.phone && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <FiPhone size={11} /> {staff.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            ROLE_BADGE_STYLES[staff.role] || ROLE_BADGE_STYLES["Custom Staff"]
                          }`}
                        >
                          {isSuper && <FiShield size={12} />}
                          {staff.role || "Staff"}
                        </span>
                      </td>

                      {/* Permissions Preview */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isWildcard ? (
                            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              Full Access (All Modules)
                            </span>
                          ) : perms.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">No permissions</span>
                          ) : (
                            <>
                              {perms.slice(0, 2).map((p) => (
                                <span
                                  key={p}
                                  className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                >
                                  {p}
                                </span>
                              ))}
                              {perms.length > 2 && (
                                <button
                                  onClick={() => openDetailModal(staff)}
                                  className="text-[11px] font-semibold text-[#4CAF37] bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                >
                                  +{perms.length - 2} more
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Active Toggle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={!canEdit || isSelf || (isSuper && stats.superAdmins <= 1) || togglingId === staff.id}
                            onClick={() => handleToggleStatus(staff)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                              staff.is_active !== false ? "bg-[#4CAF37]" : "bg-gray-300"
                            }`}
                            title={
                              isSelf
                                ? "Cannot deactivate yourself"
                                : isSuper && stats.superAdmins <= 1
                                ? "Cannot deactivate the only Super Admin"
                                : "Click to toggle active status"
                            }
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                staff.is_active !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-semibold ${
                              staff.is_active !== false ? "text-green-700" : "text-gray-400"
                            }`}
                          >
                            {staff.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {new Date(staff.created_at || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailModal(staff)}
                            title="View permissions breakdown"
                            className="p-1.5 rounded-md text-gray-500 hover:text-[#4CAF37] hover:bg-[#4CAF37]/10 transition-colors cursor-pointer"
                          >
                            <FiSliders size={16} />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => openEditModal(staff)}
                              title="Edit staff details and role"
                              className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          )}

                          {canDelete && !isSuper && !isSelf && (
                            <button
                              onClick={() => handleDeleteStaff(staff.id, staff.name)}
                              disabled={deletingId === staff.id}
                              title="Delete staff member"
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD STAFF MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#4CAF37]/10 text-[#4CAF37] rounded-lg">
                  <FiUserPlus size={18} />
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">Add New Staff Member</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg p-3 flex items-start gap-2">
                  <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@nutriexa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2 pr-10 text-sm focus:outline-none focus:border-[#4CAF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Preset Selector */}
              <div className="border-t border-gray-100 pt-4">
                <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
                  Assign System Role Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rolesMeta.roles.map((r) => {
                    const isSelected = formData.role === r.name;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => handleRoleChange(r.name)}
                        className={`p-3 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#4CAF37] bg-green-50/50 text-[#1a1a1a] ring-1 ring-[#4CAF37]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <p className="font-bold flex items-center justify-between">
                          {r.name}
                          {isSelected && <FiCheck className="text-[#4CAF37]" size={14} />}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Matrix */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                      Granular Module Permissions
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Selected:{" "}
                      <span className="font-bold text-[#4CAF37]">
                        {formData.role === "Super Admin" || formData.permissions.includes("*")
                          ? "All (Super Admin)"
                          : `${formData.permissions.length} actions`}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[11px] text-[#4CAF37] hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllPermissions}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {rolesMeta.permissionsCatalog.map((category) => {
                    const catKeys = category.permissions.map((p) => p.key);
                    const isAllCatSelected = catKeys.every(
                      (k) => formData.permissions.includes(k) || formData.permissions.includes("*")
                    );

                    return (
                      <div
                        key={category.category}
                        className="border border-gray-100 rounded-lg p-3 bg-[#fafbf9]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            {category.category}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(category.permissions)}
                            className="text-[10px] text-gray-500 hover:text-[#4CAF37] font-semibold cursor-pointer"
                          >
                            {isAllCatSelected ? "Deselect Category" : "Select Category"}
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          {category.permissions.map((perm) => {
                            const isChecked =
                              formData.permissions.includes(perm.key) ||
                              formData.permissions.includes("*") ||
                              formData.role === "Super Admin";

                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? "bg-white border-[#4CAF37]/40 text-[#1a1a1a]"
                                    : "bg-white/60 border-gray-200 text-gray-500 hover:bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 accent-[#4CAF37] rounded"
                                />
                                <div className="leading-tight">
                                  <p className="font-semibold text-[11px]">{perm.label}</p>
                                  <p className="text-[10px] text-gray-400">{perm.description}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a]">Staff Account Active</p>
                  <p className="text-[11px] text-gray-500">Allow this staff member to sign in immediately</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#4CAF37]"
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {formSubmitting ? "Creating..." : "Save Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT STAFF MODAL ================= */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FiEdit2 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a]">Edit Staff Member</h2>
                  <p className="text-xs text-gray-500">{selectedStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg p-3 flex items-start gap-2">
                  <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">
                    New Password (leave blank to keep unchanged)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2 pr-10 text-sm focus:outline-none focus:border-[#4CAF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Preset Selector */}
              <div className="border-t border-gray-100 pt-4">
                <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
                  Change Role Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rolesMeta.roles.map((r) => {
                    const isSelected = formData.role === r.name;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => handleRoleChange(r.name)}
                        className={`p-3 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#4CAF37] bg-green-50/50 text-[#1a1a1a] ring-1 ring-[#4CAF37]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <p className="font-bold flex items-center justify-between">
                          {r.name}
                          {isSelected && <FiCheck className="text-[#4CAF37]" size={14} />}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Matrix */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                      Module Permissions
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Selected:{" "}
                      <span className="font-bold text-[#4CAF37]">
                        {formData.role === "Super Admin" || formData.permissions.includes("*")
                          ? "All (Super Admin)"
                          : `${formData.permissions.length} actions`}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[11px] text-[#4CAF37] hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllPermissions}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {rolesMeta.permissionsCatalog.map((category) => {
                    const catKeys = category.permissions.map((p) => p.key);
                    const isAllCatSelected = catKeys.every(
                      (k) => formData.permissions.includes(k) || formData.permissions.includes("*")
                    );

                    return (
                      <div
                        key={category.category}
                        className="border border-gray-100 rounded-lg p-3 bg-[#fafbf9]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            {category.category}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(category.permissions)}
                            className="text-[10px] text-gray-500 hover:text-[#4CAF37] font-semibold cursor-pointer"
                          >
                            {isAllCatSelected ? "Deselect Category" : "Select Category"}
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          {category.permissions.map((perm) => {
                            const isChecked =
                              formData.permissions.includes(perm.key) ||
                              formData.permissions.includes("*") ||
                              formData.role === "Super Admin";

                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? "bg-white border-[#4CAF37]/40 text-[#1a1a1a]"
                                    : "bg-white/60 border-gray-200 text-gray-500 hover:bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 accent-[#4CAF37] rounded"
                                />
                                <div className="leading-tight">
                                  <p className="font-semibold text-[11px]">{perm.label}</p>
                                  <p className="text-[10px] text-gray-400">{perm.description}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a]">Account Status</p>
                  <p className="text-[11px] text-gray-500">Deactivated users cannot log in to the admin panel</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#4CAF37]"
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {formSubmitting ? "Updating..." : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DETAIL / BREAKDOWN MODAL ================= */}
      {isDetailModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4CAF37]/10 text-[#4CAF37] font-bold flex items-center justify-center text-sm uppercase">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1a1a1a]">{selectedStaff.name}</h2>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      ROLE_BADGE_STYLES[selectedStaff.role] || ROLE_BADGE_STYLES["Custom Staff"]
                    }`}
                  >
                    {selectedStaff.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-[#fafbf9] border border-gray-100 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Email</span>
                  <span className="font-semibold text-gray-700">{selectedStaff.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Phone</span>
                  <span className="font-semibold text-gray-700">{selectedStaff.phone || "Not set"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedStaff.is_active !== false ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {selectedStaff.is_active !== false ? "Active" : "Deactivated"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Member Since</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedStaff.created_at || Date.now()).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-2">
                  Assigned Permissions List
                </h4>

                {selectedStaff.role === "Super Admin" ||
                (Array.isArray(selectedStaff.permissions) && selectedStaff.permissions.includes("*")) ? (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                    <FiShield className="text-purple-600 mx-auto mb-1.5" size={24} />
                    <p className="text-xs font-bold text-purple-900">Super Administrator</p>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      This user has unrestricted access to all current and future store management capabilities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rolesMeta.permissionsCatalog.map((category) => {
                      const userPerms = Array.isArray(selectedStaff.permissions) ? selectedStaff.permissions : [];
                      const grantedInCat = category.permissions.filter((p) => userPerms.includes(p.key));

                      if (grantedInCat.length === 0) return null;

                      return (
                        <div key={category.category} className="border border-gray-100 rounded-lg p-2.5 bg-white">
                          <p className="text-[11px] font-bold text-gray-700 mb-1">{category.category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {grantedInCat.map((p) => (
                              <span
                                key={p.key}
                                className="inline-flex items-center gap-1 bg-green-50 text-[#4CAF37] border border-green-200 text-[10px] font-semibold px-2 py-0.5 rounded"
                              >
                                <FiCheck size={10} /> {p.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
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
