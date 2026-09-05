import { useState } from "react";
import {
  FiLayout,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiX,
  FiMove,
  FiEye,
} from "react-icons/fi";

const INITIAL_BANNERS = [
  {
    id: 1,
    title: "Summer Sale - Up to 50% OFF",
    subtitle: "On all Whey Proteins & Mass Gainers",
    cta: "Shop Now",
    ctaLink: "/deals",
    image: "",
    bgGradient: "from-indigo-600 to-purple-700",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    title: "New Arrivals: Pre-Workout Stack",
    subtitle: "Maximum Energy. Maximum Results.",
    cta: "Explore Now",
    ctaLink: "/products",
    image: "",
    bgGradient: "from-emerald-600 to-teal-700",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    title: "Free Shipping on Orders ₹999+",
    subtitle: "Limited time offer. Don't miss out!",
    cta: "Buy Now",
    ctaLink: "/products",
    image: "",
    bgGradient: "from-orange-500 to-rose-600",
    isActive: false,
    order: 3,
  },
];

const ANNOUNCEMENT_BARS = [
  { id: 1, text: "🎉 Free Shipping on orders above ₹999 | Use code NUTRIEXA10 for 10% off!", isActive: true },
  { id: 2, text: "⚡ Flash Sale: 40% off on all Pre-Workouts today only!", isActive: false },
];

const GRADIENT_OPTIONS = [
  { label: "Indigo → Purple", value: "from-indigo-600 to-purple-700" },
  { label: "Emerald → Teal", value: "from-emerald-600 to-teal-700" },
  { label: "Orange → Rose", value: "from-orange-500 to-rose-600" },
  { label: "Blue → Cyan", value: "from-blue-600 to-cyan-500" },
  { label: "Violet → Pink", value: "from-violet-600 to-pink-600" },
];

export default function HomepageCMS() {
  const [activeTab, setActiveTab] = useState("banners");
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENT_BARS);
  const [editBanner, setEditBanner] = useState(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [saved, setSaved] = useState(false);

  const newBannerTemplate = {
    id: Date.now(),
    title: "",
    subtitle: "",
    cta: "Shop Now",
    ctaLink: "/products",
    image: "",
    bgGradient: "from-indigo-600 to-purple-700",
    isActive: true,
    order: banners.length + 1,
  };

  function saveBanner(data) {
    if (isAddingBanner) {
      setBanners((prev) => [...prev, { ...data, id: Date.now() }]);
      setIsAddingBanner(false);
    } else {
      setBanners((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    }
    setEditBanner(null);
    flashSaved();
  }

  function deleteBanner(id) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  function toggleBanner(id) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  }

  function toggleAnnouncement(id) {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = ["banners", "announcements", "featured"];

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Homepage CMS</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Manage hero banners, announcements, and featured sections on your homepage.
          </p>
        </div>
        {saved && (
          <div style={{ padding: "10px 18px", background: "#ecfdf5", color: "#10b981", border: "1px solid #d1fae5", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
            ✓ Changes saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#6366f1" : "#64748b",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {tab === "banners" ? "Hero Banners" : tab === "announcements" ? "Announcement Bar" : "Featured Section"}
          </button>
        ))}
      </div>

      {/* HERO BANNERS TAB */}
      {activeTab === "banners" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button
              onClick={() => { setEditBanner(newBannerTemplate); setIsAddingBanner(true); }}
              style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiPlus size={16} /> Add Banner
            </button>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {banners.map((banner) => (
              <div key={banner.id} style={{
                background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
                overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
                {/* Banner Preview */}
                <div style={{
                  height: "100px",
                  background: `linear-gradient(135deg, var(--tw-gradient-stops, #6366f1, #8b5cf6))`,
                  backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "20px 24px", position: "relative"
                }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "18px" }}>{banner.title || "Untitled Banner"}</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px" }}>{banner.subtitle}</div>
                  {banner.cta && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ display: "inline-block", padding: "5px 14px", background: "#fff", color: "#6366f1", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                        {banner.cta}
                      </span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: banner.isActive ? "#ecfdf5" : "#f1f5f9",
                      color: banner.isActive ? "#10b981" : "#94a3b8",
                    }}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ padding: "14px 20px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ flex: 1, fontSize: "13px", color: "#64748b" }}>Order #{banner.order} · {banner.ctaLink}</span>
                  <button onClick={() => toggleBanner(banner.id)}
                    style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: banner.isActive ? "#ef4444" : "#10b981" }}>
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => { setEditBanner({ ...banner }); setIsAddingBanner(false); }}
                    style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#6366f1" }}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button onClick={() => deleteBanner(banner.id)}
                    style={{ padding: "6px 14px", border: "1px solid #fee2e2", borderRadius: "7px", background: "#fef2f2", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#ef4444" }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div style={{ display: "grid", gap: "12px" }}>
          {announcements.map((ann) => (
            <div key={ann.id} style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
              padding: "20px", display: "flex", alignItems: "center", gap: "16px"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{ann.text}</div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: ann.isActive ? "#10b981" : "#94a3b8" }}>
                  {ann.isActive ? "● Currently Active" : "○ Inactive"}
                </div>
              </div>
              <button onClick={() => toggleAnnouncement(ann.id)}
                style={{
                  padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                  background: ann.isActive ? "#fef2f2" : "#ecfdf5",
                  color: ann.isActive ? "#ef4444" : "#10b981",
                }}>
                {ann.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
          <div style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
            Only one announcement bar can be active at a time.
          </div>
        </div>
      )}

      {/* FEATURED SECTION TAB */}
      {activeTab === "featured" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "32px", textAlign: "center" }}>
          <FiLayout size={48} style={{ color: "#c7d2fe", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Featured Section Manager</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Configure which products or categories appear in featured sections. This connects to your product catalog.
          </p>
          <button style={{ marginTop: "20px", padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
            Configure Featured Products
          </button>
        </div>
      )}

      {/* EDIT BANNER MODAL */}
      {editBanner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{isAddingBanner ? "Add Banner" : "Edit Banner"}</h2>
              <button onClick={() => { setEditBanner(null); setIsAddingBanner(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            {[
              { label: "Banner Title", key: "title", placeholder: "e.g. Summer Sale - 50% OFF" },
              { label: "Subtitle", key: "subtitle", placeholder: "e.g. On all Whey Proteins" },
              { label: "CTA Button Text", key: "cta", placeholder: "e.g. Shop Now" },
              { label: "CTA Link", key: "ctaLink", placeholder: "e.g. /products" },
              { label: "Image URL (optional)", key: "image", placeholder: "https://..." },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  {field.label}
                </label>
                <input
                  value={editBanner[field.key] || ""}
                  onChange={(e) => setEditBanner((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <input type="checkbox" id="bannerActive" checked={editBanner.isActive}
                onChange={(e) => setEditBanner((prev) => ({ ...prev, isActive: e.target.checked }))} />
              <label htmlFor="bannerActive" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Active (visible on homepage)</label>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setEditBanner(null); setIsAddingBanner(false); }}
                style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={() => saveBanner(editBanner)}
                style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSave size={15} /> Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
