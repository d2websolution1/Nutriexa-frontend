import { useState, useEffect } from "react";
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiCheck,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiToggleLeft,
  FiToggleRight,
  FiSliders,
  FiExternalLink,
  FiNavigation,
  FiClock,
  FiShield,
} from "react-icons/fi";
import { API_URL } from "../../config";

export default function Shipping() {
  const [zones, setZones] = useState([]);
  const [partners, setPartners] = useState([]);
  const [settings, setSettings] = useState({
    freeShippingThreshold: 999,
    defaultStandardRate: 49,
    defaultExpressRate: 99,
    codCharges: 40,
    enableCod: true,
    enableExpress: true,
    estimatedDays: "3-5 business days",
    shippingPolicy: "Free shipping on orders above ₹999. Standard delivery takes 3-5 business days across India.",
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [activeTab, setActiveTab] = useState("zones");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Zone Modals
  const [editZone, setEditZone] = useState(null);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [savingZone, setSavingZone] = useState(false);

  // Partner Modals
  const [editPartner, setEditPartner] = useState(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [savingPartner, setSavingPartner] = useState(false);

  // Shipping Rate Simulator
  const [simCity, setSimCity] = useState("Mumbai");
  const [simState, setSimState] = useState("Maharashtra");
  const [simPincode, setSimPincode] = useState("400001");
  const [simSubtotal, setSimSubtotal] = useState(1200);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    fetchAllShippingData();
  }, []);

  async function fetchAllShippingData() {
    setLoading(true);
    try {
      const [zonesRes, partnersRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/shipping/zones`),
        fetch(`${API_URL}/api/shipping/partners`),
        fetch(`${API_URL}/api/shipping/settings`),
      ]);

      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData);
      }
      if (partnersRes.ok) {
        const partnersData = await partnersRes.json();
        setPartners(partnersData);
      }
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Failed to load shipping data:", err);
    } finally {
      setLoading(false);
    }
  }

  function flash(msg = "Changes saved successfully!") {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 2500);
  }

  /* ==========================================================
     ZONES CRUD & TOGGLE
  ========================================================== */
  const newZoneTemplate = {
    name: "",
    areas: "",
    deliveryDays: "3-5",
    standardRate: 49,
    expressRate: 99,
    freeAbove: 999,
    isActive: true,
  };

  async function saveZone(zoneData) {
    if (!zoneData.name?.trim()) {
      alert("Please enter a Zone Name.");
      return;
    }
    setSavingZone(true);
    try {
      if (isAddingZone) {
        const res = await fetch(`${API_URL}/api/shipping/zones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zoneData),
        });
        if (res.ok) {
          const data = await res.json();
          setZones((prev) => [...prev, data.zone]);
          flash("New zone added successfully!");
        } else {
          const err = await res.json();
          alert(err.message || "Failed to add zone");
        }
      } else {
        const res = await fetch(`${API_URL}/api/shipping/zones/${zoneData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zoneData),
        });
        if (res.ok) {
          const data = await res.json();
          setZones((prev) => prev.map((z) => (z.id === zoneData.id ? data.zone : z)));
          flash("Zone updated successfully!");
        } else {
          const err = await res.json();
          alert(err.message || "Failed to update zone");
        }
      }
      setEditZone(null);
      setIsAddingZone(false);
    } catch (err) {
      console.error("Error saving zone:", err);
      alert("Network error saving zone.");
    } finally {
      setSavingZone(false);
    }
  }

  async function toggleZoneStatus(id) {
    // Optimistic UI update
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
    );
    try {
      const res = await fetch(`${API_URL}/api/shipping/zones/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setZones((prev) => prev.map((z) => (z.id === id ? data.zone : z)));
        flash(`Zone is now ${data.zone.isActive ? "Active" : "Inactive"}`);
      }
    } catch (err) {
      console.error("Failed to toggle zone status:", err);
      // Revert if error
      setZones((prev) =>
        prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
      );
    }
  }

  async function deleteZone(id, zoneName) {
    if (!window.confirm(`Are you sure you want to delete "${zoneName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/shipping/zones/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setZones((prev) => prev.filter((z) => z.id !== id));
        flash("Zone deleted successfully!");
      }
    } catch (err) {
      console.error("Failed to delete zone:", err);
    }
  }

  /* ==========================================================
     DELIVERY PARTNERS CRUD & TOGGLE
  ========================================================== */
  const newPartnerTemplate = {
    name: "",
    logo: "🚚",
    status: "Connected",
    trackingSupport: true,
    apiKey: "",
    accountId: "",
    trackingUrl: "https://",
  };

  async function togglePartner(id) {
    try {
      const res = await fetch(`${API_URL}/api/shipping/partners/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setPartners((prev) => prev.map((p) => (p.id === id ? data.partner : p)));
        flash(`Partner status: ${data.partner.status}`);
      }
    } catch (err) {
      console.error("Failed to toggle partner:", err);
    }
  }

  async function savePartner(partnerData) {
    if (!partnerData.name?.trim()) {
      alert("Please enter partner name.");
      return;
    }
    setSavingPartner(true);
    try {
      if (isAddingPartner) {
        const res = await fetch(`${API_URL}/api/shipping/partners`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partnerData),
        });
        if (res.ok) {
          const data = await res.json();
          setPartners((prev) => [...prev, data.partner]);
          flash("Partner added successfully!");
        }
      } else {
        const res = await fetch(`${API_URL}/api/shipping/partners/${partnerData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partnerData),
        });
        if (res.ok) {
          const data = await res.json();
          setPartners((prev) => prev.map((p) => (p.id === partnerData.id ? data.partner : p)));
          flash("Partner updated successfully!");
        }
      }
      setEditPartner(null);
      setIsAddingPartner(false);
    } catch (err) {
      console.error("Error saving partner:", err);
    } finally {
      setSavingPartner(false);
    }
  }

  async function deletePartner(id, name) {
    if (!window.confirm(`Are you sure you want to remove delivery partner "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/shipping/partners/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
        flash("Partner removed.");
      }
    } catch (err) {
      console.error("Failed to delete partner:", err);
    }
  }

  /* ==========================================================
     GLOBAL SETTINGS
  ========================================================== */
  async function saveGlobalSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/api/shipping/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        flash("Global shipping settings updated successfully!");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save shipping settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  /* ==========================================================
     SHIPPING RATE SIMULATOR (REAL-TIME TEST)
  ========================================================== */
  async function runSimulator(e) {
    e?.preventDefault();
    setSimLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/shipping/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: simCity,
          state: simState,
          pincode: simPincode,
          subtotal: Number(simSubtotal) || 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch (err) {
      console.error("Simulator error:", err);
    } finally {
      setSimLoading(false);
    }
  }

  // Filtered zones
  const filteredZones = zones.filter((z) => {
    const matchesSearch =
      z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.areas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? z.isActive
        : !z.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeZonesCount = zones.filter((z) => z.isActive).length;
  const connectedPartnersCount = partners.filter((p) => p.status === "Connected").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2.5">
            <FiTruck size={24} className="text-[#4CAF37]" /> Shipping Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure real-time delivery zones, shipping rates, active/inactive controls, and logistics partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {savedMessage && (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs animate-fadeIn">
              <FiCheck size={14} /> {savedMessage}
            </div>
          )}

          <button
            onClick={fetchAllShippingData}
            title="Refresh All Shipping Data"
            className="p-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-xs"
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#4CAF37] flex items-center justify-center font-bold">
            <FiMapPin size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Active Zones</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white">
              {activeZonesCount} <span className="text-xs text-gray-400 font-normal">/ {zones.length}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <FiPackage size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Free Shipping Above</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white">
              ₹{settings.freeShippingThreshold}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <FiTruck size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Delivery Partners</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white">
              {connectedPartnersCount} <span className="text-xs text-gray-400 font-normal">Connected</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            <FiDollarSign size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Standard / COD Fee</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white">
              ₹{settings.defaultStandardRate} / ₹{settings.codCharges}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1 w-fit">
          {[
            { key: "zones", label: "Shipping Zones" },
            { key: "partners", label: "Delivery Partners" },
            { key: "settings", label: "Global Settings" },
            { key: "simulator", label: "Rate Simulator" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white dark:bg-white/20 text-[#1a1a1a] dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "zones" && (
          <button
            onClick={() => {
              setEditZone(newZoneTemplate);
              setIsAddingZone(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <FiPlus size={16} /> Add Zone
          </button>
        )}

        {activeTab === "partners" && (
          <button
            onClick={() => {
              setEditPartner(newPartnerTemplate);
              setIsAddingPartner(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <FiPlus size={16} /> Add Partner
          </button>
        )}
      </div>

      {/* ==========================================================
          TAB 1: SHIPPING ZONES
      ========================================================== */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search zone name or city..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-[#4CAF37]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg px-2.5 py-1.5 outline-none font-medium"
              >
                <option value="all">All Zones ({zones.length})</option>
                <option value="active">Active Only ({activeZonesCount})</option>
                <option value="inactive">Inactive Only ({zones.length - activeZonesCount})</option>
              </select>
            </div>
          </div>

          {/* Zones Table */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                    <th className="px-4 py-3 font-semibold">Zone</th>
                    <th className="px-4 py-3 font-semibold">Delivery Areas</th>
                    <th className="px-4 py-3 font-semibold">Delivery Days</th>
                    <th className="px-4 py-3 font-semibold">Std. Rate</th>
                    <th className="px-4 py-3 font-semibold">Express Rate</th>
                    <th className="px-4 py-3 font-semibold">Free Above</th>
                    <th className="px-4 py-3 font-semibold text-center">Status (Click to toggle)</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {filteredZones.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400">
                        No shipping zones match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map((zone) => (
                      <tr key={zone.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {zone.name}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={zone.areas}>
                          {zone.areas}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                          {zone.deliveryDays} days
                        </td>
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap">
                          {zone.standardRate === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                              FREE
                            </span>
                          ) : (
                            <span className="text-gray-900 dark:text-white">₹{zone.standardRate}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {zone.expressRate === 0 ? (
                            <span className="text-gray-400 italic">N/A</span>
                          ) : (
                            <span>₹{zone.expressRate}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                          ₹{zone.freeAbove}+
                        </td>

                        {/* Real-time Click-to-Toggle Status Button */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => toggleZoneStatus(zone.id)}
                            title="Click to toggle Active / Inactive"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                              zone.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/10"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                zone.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                              }`}
                            />
                            {zone.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditZone({ ...zone });
                                setIsAddingZone(false);
                              }}
                              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              title="Edit Zone"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteZone(zone.id, zone.name)}
                              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              title="Delete Zone"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: DELIVERY PARTNERS
      ========================================================== */}
      {activeTab === "partners" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-3xl mb-3">{p.logo || "🚚"}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditPartner({ ...p });
                        setIsAddingPartner(false);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                      title="Edit Partner Settings"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => deletePartner(p.id, p.name)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove Partner"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="font-extrabold text-base text-gray-900 dark:text-white mb-1.5">
                  {p.name}
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                      p.status === "Connected"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.trackingSupport && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full font-semibold">
                      Live Tracking ✓
                    </span>
                  )}
                </div>

                {p.trackingUrl && (
                  <p className="text-[11px] text-gray-400 truncate mb-4" title={p.trackingUrl}>
                    URL: {p.trackingUrl}
                  </p>
                )}
              </div>

              <button
                onClick={() => togglePartner(p.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  p.status === "Connected"
                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400"
                }`}
              >
                {p.status === "Connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================================
          TAB 3: GLOBAL SETTINGS
      ========================================================== */}
      {activeTab === "settings" && (
        <form
          onSubmit={saveGlobalSettings}
          className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-6 max-w-2xl space-y-5"
        >
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              Global Shipping Settings
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              These settings apply store-wide and are fetched by Cart and Checkout in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Orders with cart subtotal ≥ this amount get free shipping.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Default Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={settings.defaultStandardRate}
                onChange={(e) => setSettings({ ...settings, defaultStandardRate: Number(e.target.value) })}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Charged when order subtotal is below the free shipping threshold.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Default Express Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={settings.defaultExpressRate}
                onChange={(e) => setSettings({ ...settings, defaultExpressRate: Number(e.target.value) })}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Cash On Delivery (COD) Fee (₹)
              </label>
              <input
                type="number"
                value={settings.codCharges}
                onChange={(e) => setSettings({ ...settings, codCharges: Number(e.target.value) })}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Enable Cash On Delivery (COD)</div>
                <div className="text-[11px] text-gray-500">Allow customers to choose Cash on Delivery at checkout</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCod}
                onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                className="w-5 h-5 rounded cursor-pointer accent-[#4CAF37]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Enable Express Delivery Option</div>
                <div className="text-[11px] text-gray-500">Allow customers to choose priority 1-2 days shipping</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableExpress}
                onChange={(e) => setSettings({ ...settings, enableExpress: e.target.checked })}
                className="w-5 h-5 rounded cursor-pointer accent-[#4CAF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Estimated Delivery Window
            </label>
            <input
              type="text"
              value={settings.estimatedDays}
              onChange={(e) => setSettings({ ...settings, estimatedDays: e.target.value })}
              placeholder="e.g. 3-5 business days"
              className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shipping Policy & Dispatch Note
            </label>
            <textarea
              rows={3}
              value={settings.shippingPolicy}
              onChange={(e) => setSettings({ ...settings, shippingPolicy: e.target.value })}
              className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
            />
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <FiSave size={15} /> {savingSettings ? "Saving..." : "Save Settings to Database"}
          </button>
        </form>
      )}

      {/* ==========================================================
          TAB 4: RATE SIMULATOR (LIVE REAL-TIME TEST)
      ========================================================== */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <form
            onSubmit={runSimulator}
            className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-6 space-y-4"
          >
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FiSliders className="text-[#4CAF37]" /> Real-Time Rate Calculator
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Simulate how the live API calculates shipping for any customer location & subtotal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                City Name
              </label>
              <input
                type="text"
                value={simCity}
                onChange={(e) => setSimCity(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                State Name
              </label>
              <input
                type="text"
                value={simState}
                onChange={(e) => setSimState(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={simPincode}
                onChange={(e) => setSimPincode(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Order Subtotal (₹)
              </label>
              <input
                type="number"
                value={simSubtotal}
                onChange={(e) => setSimSubtotal(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
              />
            </div>

            <button
              type="submit"
              disabled={simLoading}
              className="w-full py-2.5 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {simLoading ? "Calculating..." : "Test Calculate Shipping"}
            </button>
          </form>

          {/* Simulator Result Output */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                Calculation Output
              </h4>

              {simResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Matched Zone</div>
                    <div className="text-base font-extrabold text-emerald-900 dark:text-white">
                      {simResult.zoneName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                      <div className="text-gray-400 text-[10px]">Standard Shipping</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {simResult.standardRate === 0 ? "FREE" : `₹${simResult.standardRate}`}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                      <div className="text-gray-400 text-[10px]">Express Shipping</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {simResult.expressRate ? `₹${simResult.expressRate}` : "Not Available"}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                      <div className="text-gray-400 text-[10px]">Delivery Days</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {simResult.deliveryDays}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                      <div className="text-gray-400 text-[10px]">COD Extra Charges</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {simResult.enableCod ? `₹${simResult.codCharges}` : "COD Disabled"}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                    Free shipping qualification: Cart ₹{simSubtotal} {simResult.isFree ? "qualifies for FREE delivery!" : `(free above ₹${simResult.freeThreshold})`}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Fill in the form on the left and click "Test Calculate Shipping" to preview the real-time calculated rate.
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 mt-4 border-t border-gray-100 dark:border-white/10 pt-3">
              Endpoint: <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">POST /api/shipping/calculate</code>
            </p>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL: ADD / EDIT SHIPPING ZONE (WITH ACTIVE/INACTIVE OPTION)
      ========================================================== */}
      {editZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {isAddingZone ? "Add New Shipping Zone" : "Edit Shipping Zone"}
              </h2>
              <button
                onClick={() => {
                  setEditZone(null);
                  setIsAddingZone(false);
                }}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  value={editZone.name}
                  placeholder="e.g. Metro Cities, West Zone, etc."
                  onChange={(e) => setEditZone({ ...editZone, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Areas (Comma-separated cities, states, or regions)
                </label>
                <textarea
                  rows={2}
                  value={editZone.areas}
                  placeholder="e.g. Mumbai, Delhi, Bengaluru, Chennai, Hyderabad"
                  onChange={(e) => setEditZone({ ...editZone, areas: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Days
                  </label>
                  <input
                    type="text"
                    value={editZone.deliveryDays}
                    placeholder="e.g. 2-3"
                    onChange={(e) => setEditZone({ ...editZone, deliveryDays: e.target.value })}
                    className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Standard Rate (₹) — 0 for FREE
                  </label>
                  <input
                    type="number"
                    value={editZone.standardRate}
                    onChange={(e) => setEditZone({ ...editZone, standardRate: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Express Rate (₹) — 0 = N/A
                  </label>
                  <input
                    type="number"
                    value={editZone.expressRate}
                    onChange={(e) => setEditZone({ ...editZone, expressRate: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Free Shipping Above (₹)
                  </label>
                  <input
                    type="number"
                    value={editZone.freeAbove}
                    onChange={(e) => setEditZone({ ...editZone, freeAbove: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                  />
                </div>
              </div>

              {/* Status Option in Modal (Active / Inactive) */}
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Zone Status</div>
                  <div className="text-[11px] text-gray-500">
                    {editZone.isActive ? "This zone is ACTIVE and currently calculating shipping rates." : "This zone is INACTIVE and skipped."}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editZone.isActive}
                    onChange={(e) => setEditZone({ ...editZone, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF37]" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setEditZone(null);
                  setIsAddingZone(false);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingZone}
                onClick={() => saveZone(editZone)}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <FiSave size={14} /> {savingZone ? "Saving..." : "Save Zone"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL: ADD / EDIT DELIVERY PARTNER
      ========================================================== */}
      {editPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {isAddingPartner ? "Add Delivery Partner" : "Edit Partner Settings"}
              </h2>
              <button
                onClick={() => {
                  setEditPartner(null);
                  setIsAddingPartner(false);
                }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Partner Name *
                </label>
                <input
                  type="text"
                  value={editPartner.name}
                  placeholder="e.g. Shiprocket, Delhivery, Shadowfax"
                  onChange={(e) => setEditPartner({ ...editPartner, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Logo / Emoji
                </label>
                <input
                  type="text"
                  value={editPartner.logo}
                  placeholder="e.g. 🚀, 🔵, 📦"
                  onChange={(e) => setEditPartner({ ...editPartner, logo: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tracking Base URL
                </label>
                <input
                  type="text"
                  value={editPartner.trackingUrl}
                  placeholder="https://..."
                  onChange={(e) => setEditPartner({ ...editPartner, trackingUrl: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none focus:border-[#4CAF37]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Live Tracking Support
                </span>
                <input
                  type="checkbox"
                  checked={editPartner.trackingSupport}
                  onChange={(e) => setEditPartner({ ...editPartner, trackingSupport: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-[#4CAF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setEditPartner(null);
                  setIsAddingPartner(false);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPartner}
                onClick={() => savePartner(editPartner)}
                className="px-5 py-2 bg-[#4CAF37] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                {savingPartner ? "Saving..." : "Save Partner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
