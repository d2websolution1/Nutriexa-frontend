import { useState } from "react";
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiMapPin,
  FiToggleLeft,
  FiPackage,
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";

const SHIPPING_ZONES = [
  {
    id: 1,
    name: "Metro Cities",
    areas: "Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Pune, Kolkata",
    deliveryDays: "2-3",
    standardRate: 0,
    expressRate: 69,
    freeAbove: 999,
    isActive: true,
  },
  {
    id: 2,
    name: "Tier-2 Cities",
    areas: "Jaipur, Lucknow, Surat, Ahmedabad, Chandigarh, Bhopal, Nagpur",
    deliveryDays: "3-5",
    standardRate: 49,
    expressRate: 99,
    freeAbove: 999,
    isActive: true,
  },
  {
    id: 3,
    name: "Rest of India",
    areas: "All remaining pin codes across India",
    deliveryDays: "5-7",
    standardRate: 79,
    expressRate: 149,
    freeAbove: 1499,
    isActive: true,
  },
  {
    id: 4,
    name: "Northeast & J&K",
    areas: "Assam, Meghalaya, Manipur, Nagaland, J&K, Ladakh",
    deliveryDays: "7-12",
    standardRate: 99,
    expressRate: 0,
    freeAbove: 1999,
    isActive: false,
  },
];

const DELIVERY_PARTNERS = [
  { id: 1, name: "Shiprocket", logo: "🚀", status: "Connected", trackingSupport: true },
  { id: 2, name: "Delhivery", logo: "🔵", status: "Connected", trackingSupport: true },
  { id: 3, name: "BlueDart", logo: "🔷", status: "Disconnected", trackingSupport: true },
  { id: 4, name: "DTDC", logo: "🟡", status: "Disconnected", trackingSupport: false },
];

export default function Shipping() {
  const [zones, setZones] = useState(SHIPPING_ZONES);
  const [partners, setPartners] = useState(DELIVERY_PARTNERS);
  const [editZone, setEditZone] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("zones");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [saved, setSaved] = useState(false);

  const newZoneTemplate = {
    id: Date.now(),
    name: "",
    areas: "",
    deliveryDays: "3-5",
    standardRate: 49,
    expressRate: 99,
    freeAbove: 999,
    isActive: true,
  };

  function saveZone(data) {
    if (isAdding) {
      setZones((prev) => [...prev, { ...data, id: Date.now() }]);
      setIsAdding(false);
    } else {
      setZones((prev) => prev.map((z) => (z.id === data.id ? data : z)));
    }
    setEditZone(null);
    flash();
  }

  function deleteZone(id) {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  function togglePartner(id) {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Connected" ? "Disconnected" : "Connected" }
          : p
      )
    );
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2.5">
            <FiTruck size={24} className="text-[#4CAF37]" /> Shipping Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure delivery zones, shipping rates, and logistics partners.
          </p>
        </div>
        {saved && (
          <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto">
            <FiCheck size={14} /> Saved successfully!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 dark:bg-white/10 rounded-xl p-1.5 w-fit">
        {[
          { key: "zones", label: "Shipping Zones" },
          { key: "partners", label: "Delivery Partners" },
          { key: "settings", label: "Global Settings" },
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

      {/* ZONES TAB */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditZone(newZoneTemplate);
                setIsAdding(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <FiPlus size={16} /> Add Zone
            </button>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                    {["Zone", "Delivery Areas", "Delivery Days", "Std. Rate", "Express Rate", "Free Above", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {zone.name}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {zone.areas}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                        {zone.deliveryDays} days
                      </td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap">
                        {zone.standardRate === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">₹{zone.standardRate}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {zone.expressRate === 0 ? "N/A" : `₹${zone.expressRate}`}
                      </td>
                      <td className="px-4 py-3.5 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        ₹{zone.freeAbove}+
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                            zone.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {zone.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditZone({ ...zone });
                              setIsAdding(false);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit Zone"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteZone(zone.id)}
                            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Delete Zone"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY PARTNERS TAB */}
      {activeTab === "partners" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-3">{p.logo}</div>
                <div className="font-extrabold text-base text-gray-900 dark:text-white mb-1.5">{p.name}</div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
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

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-6 max-w-lg">
          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">
            Global Shipping Settings
          </h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Orders above this amount get free standard shipping across applicable zones.
            </p>
          </div>
          <button
            onClick={flash}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4CAF37] hover:bg-[#439e2f] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <FiSave size={15} /> Save Settings
          </button>
        </div>
      )}

      {/* EDIT ZONE MODAL */}
      {editZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {isAdding ? "Add Shipping Zone" : "Edit Shipping Zone"}
              </h2>
              <button
                onClick={() => {
                  setEditZone(null);
                  setIsAdding(false);
                }}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                { label: "Zone Name", key: "name", type: "text", placeholder: "e.g. Metro Cities" },
                { label: "Delivery Areas", key: "areas", type: "text", placeholder: "e.g. Mumbai, Delhi, ..." },
                { label: "Delivery Days", key: "deliveryDays", type: "text", placeholder: "e.g. 2-3" },
                { label: "Standard Rate (₹)", key: "standardRate", type: "number" },
                { label: "Express Rate (₹) — 0 = N/A", key: "expressRate", type: "number" },
                { label: "Free Shipping Above (₹)", key: "freeAbove", type: "number" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={editZone[f.key]}
                    placeholder={f.placeholder || ""}
                    onChange={(e) =>
                      setEditZone((prev) => ({
                        ...prev,
                        [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#4CAF37]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => {
                  setEditZone(null);
                  setIsAdding(false);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveZone(editZone)}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4CAF37] hover:bg-[#439e2f] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <FiSave size={14} /> Save Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
