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
  const [partners] = useState(DELIVERY_PARTNERS);
  const [editZone, setEditZone] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("zones");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [saved, setSaved] = useState(false);

  const newZoneTemplate = {
    id: Date.now(), name: "", areas: "", deliveryDays: "3-5",
    standardRate: 49, expressRate: 99, freeAbove: 999, isActive: true,
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

  function deleteZone(id) { setZones((prev) => prev.filter((z) => z.id !== id)); }
  function toggleZone(id) { setZones((prev) => prev.map((z) => z.id === id ? { ...z, isActive: !z.isActive } : z)); }
  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Shipping</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Configure shipping zones, delivery partners, and rate settings.
          </p>
        </div>
        {saved && (
          <div style={{ padding: "9px 16px", background: "#ecfdf5", color: "#10b981", border: "1px solid #d1fae5", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
            ✓ Saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" }}>
        {["zones", "partners", "settings"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#6366f1" : "#64748b",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {tab === "zones" ? "Shipping Zones" : tab === "partners" ? "Delivery Partners" : "Settings"}
          </button>
        ))}
      </div>

      {/* ZONES */}
      {activeTab === "zones" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button onClick={() => { setEditZone(newZoneTemplate); setIsAdding(true); }}
              style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiPlus size={16} /> Add Zone
            </button>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Zone", "Delivery Areas", "Delivery Days", "Std. Rate", "Express Rate", "Free Above", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#0f172a" }}>{zone.name}</td>
                    <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "12px", maxWidth: "200px" }}>{zone.areas}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{zone.deliveryDays} days</td>
                    <td style={{ padding: "14px 16px", color: zone.standardRate === 0 ? "#10b981" : "#374151", fontWeight: 600 }}>
                      {zone.standardRate === 0 ? "FREE" : `₹${zone.standardRate}`}
                    </td>
                    <td style={{ padding: "14px 16px", color: zone.expressRate === 0 ? "#94a3b8" : "#374151" }}>
                      {zone.expressRate === 0 ? "N/A" : `₹${zone.expressRate}`}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>₹{zone.freeAbove}+</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                        background: zone.isActive ? "#ecfdf5" : "#f1f5f9",
                        color: zone.isActive ? "#10b981" : "#94a3b8",
                      }}>
                        {zone.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditZone({ ...zone }); setIsAdding(false); }}
                          style={{ padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#6366f1", fontWeight: 500 }}>
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => deleteZone(zone.id)}
                          style={{ padding: "5px 10px", border: "1px solid #fee2e2", borderRadius: "6px", background: "#fef2f2", cursor: "pointer", color: "#ef4444" }}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* DELIVERY PARTNERS */}
      {activeTab === "partners" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {partners.map((p) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{p.logo}</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                  background: p.status === "Connected" ? "#ecfdf5" : "#fef2f2",
                  color: p.status === "Connected" ? "#10b981" : "#ef4444",
                }}>
                  {p.status}
                </span>
                {p.trackingSupport && (
                  <span style={{ fontSize: "11px", color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: "20px", fontWeight: 500 }}>
                    Tracking ✓
                  </span>
                )}
              </div>
              <button style={{
                width: "100%", padding: "9px", border: `1px solid ${p.status === "Connected" ? "#fee2e2" : "#d1fae5"}`,
                borderRadius: "8px", background: p.status === "Connected" ? "#fef2f2" : "#ecfdf5",
                color: p.status === "Connected" ? "#ef4444" : "#10b981",
                fontWeight: 600, fontSize: "13px", cursor: "pointer"
              }}>
                {p.status === "Connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "28px", maxWidth: "520px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700 }}>Global Shipping Settings</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Orders above this amount get free standard shipping.</div>
          </div>
          <button onClick={flash}
            style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiSave size={15} /> Save Settings
          </button>
        </div>
      )}

      {/* EDIT ZONE MODAL */}
      {editZone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{isAdding ? "Add Zone" : "Edit Zone"}</h2>
              <button onClick={() => { setEditZone(null); setIsAdding(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            {[
              { label: "Zone Name", key: "name", type: "text", placeholder: "e.g. Metro Cities" },
              { label: "Delivery Areas", key: "areas", type: "text", placeholder: "e.g. Mumbai, Delhi, ..." },
              { label: "Delivery Days", key: "deliveryDays", type: "text", placeholder: "e.g. 2-3" },
              { label: "Standard Rate (₹)", key: "standardRate", type: "number" },
              { label: "Express Rate (₹) — 0 = N/A", key: "expressRate", type: "number" },
              { label: "Free Shipping Above (₹)", key: "freeAbove", type: "number" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{f.label}</label>
                <input type={f.type} value={editZone[f.key]} placeholder={f.placeholder || ""}
                  onChange={(e) => setEditZone((prev) => ({ ...prev, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => { setEditZone(null); setIsAdding(false); }}
                style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={() => saveZone(editZone)}
                style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSave size={15} /> Save Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
