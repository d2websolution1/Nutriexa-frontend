import { useState, useEffect } from "react";
import {
  FiLayout,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { API_URL } from "../../config";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/cms/banners`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  }

  const newBannerTemplate = {
    title: "",
    subtitle: "",
    cta: "Shop Now",
    ctaLink: "/products",
    image: "",
    bgGradient: "from-indigo-600 to-purple-700",
    isActive: true,
    order: banners.length + 1,
  };

  async function saveBanner(data) {
    try {
      if (isAddingBanner) {
        const res = await fetch(`${API_URL}/api/cms/banners`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          setBanners((prev) => [...prev, resData.banner]);
        } else {
          setBanners((prev) => [...prev, { ...data, id: Date.now() }]);
        }
        setIsAddingBanner(false);
      } else {
        const res = await fetch(`${API_URL}/api/cms/banners/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          setBanners((prev) => prev.map((b) => (b.id === data.id ? resData.banner : b)));
        } else {
          setBanners((prev) => prev.map((b) => (b.id === data.id ? data : b)));
        }
      }
      setEditBanner(null);
      flashSaved();
    } catch (err) {
      console.error("Error saving banner:", err);
      flashSaved();
    }
  }

  async function deleteBanner(id) {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await fetch(`${API_URL}/api/cms/banners/${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((b) => b.id !== id));
      flashSaved();
    } catch (err) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  }

  async function toggleBanner(id) {
    try {
      const res = await fetch(`${API_URL}/api/cms/banners/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const resData = await res.json();
        setBanners((prev) => prev.map((b) => (b.id === id ? resData.banner : b)));
      } else {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
      }
      flashSaved();
    } catch (err) {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    }
  }

  function toggleAnnouncement(id) {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = ["banners", "announcements", "featured"];

  const getGradientCss = (gradientClass) => {
    switch (gradientClass) {
      case "from-emerald-600 to-teal-700":
        return "linear-gradient(135deg, #059669, #0f766e)";
      case "from-orange-500 to-rose-600":
        return "linear-gradient(135deg, #f97316, #e11d48)";
      case "from-blue-600 to-cyan-500":
        return "linear-gradient(135deg, #2563eb, #06b6d4)";
      case "from-violet-600 to-pink-600":
        return "linear-gradient(135deg, #7c3aed, #db2777)";
      default:
        return "linear-gradient(135deg, #4f46e5, #7e22ce)";
    }
  };

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
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && (
            <div style={{ padding: "10px 18px", background: "#ecfdf5", color: "#10b981", border: "1px solid #d1fae5", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
              ✓ Changes saved!
            </div>
          )}
          <button
            onClick={fetchBanners}
            title="Refresh"
            style={{ padding: "10px 14px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: "8px", cursor: "pointer", color: "#64748b" }}
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
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
                  minHeight: "110px",
                  background: getGradientCss(banner.bgGradient),
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "20px 24px", position: "relative"
                }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "19px", letterSpacing: "0.2px" }}>
                    {banner.title || "Untitled Banner"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "13.5px", marginTop: "4px" }}>
                    {banner.subtitle}
                  </div>
                  {banner.cta && (
                    <div style={{ marginTop: "10px" }}>
                      <span style={{ display: "inline-block", padding: "6px 16px", background: "#fff", color: "#1e293b", borderRadius: "6px", fontSize: "12px", fontWeight: 700, boxShadow: "0 2px 5px rgba(0,0,0,0.15)" }}>
                        {banner.cta} →
                      </span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "14px", right: "14px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                      background: banner.isActive ? "#ecfdf5" : "#f1f5f9",
                      color: banner.isActive ? "#059669" : "#64748b",
                      border: banner.isActive ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                    }}>
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ padding: "14px 20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ flex: 1, fontSize: "13px", color: "#64748b" }}>
                    Order #{banner.order} · Link: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{banner.ctaLink}</code>
                  </span>
                  <button onClick={() => toggleBanner(banner.id)}
                    style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: banner.isActive ? "#ef4444" : "#10b981" }}>
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => { setEditBanner({ ...banner }); setIsAddingBanner(false); }}
                    style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#6366f1", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button onClick={() => deleteBanner(banner.id)}
                    style={{ padding: "6px 14px", border: "1px solid #fee2e2", borderRadius: "7px", background: "#fef2f2", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
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
        </div>
      )}

      {/* EDIT / ADD BANNER MODAL */}
      {editBanner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "540px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                {isAddingBanner ? "Add New Hero Banner" : "Edit Banner"}
              </h2>
              <button onClick={() => { setEditBanner(null); setIsAddingBanner(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            {[
              { label: "Banner Headline / Title", key: "title", placeholder: "e.g. Summer Sale - Up to 50% OFF" },
              { label: "Subtitle / Tagline", key: "subtitle", placeholder: "e.g. On all Whey Proteins & Mass Gainers" },
              { label: "CTA Button Text", key: "cta", placeholder: "e.g. Shop Now" },
              { label: "CTA Link", key: "ctaLink", placeholder: "e.g. /products or /deals" },
              { label: "Product / Banner Image URL (optional)", key: "image", placeholder: "https://..." },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  {field.label}
                </label>
                <input
                  value={editBanner[field.key] || ""}
                  onChange={(e) => setEditBanner((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {/* Gradient Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                Color Theme / Gradient
              </label>
              <select
                value={editBanner.bgGradient || "from-indigo-600 to-purple-700"}
                onChange={(e) => setEditBanner((prev) => ({ ...prev, bgGradient: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff" }}
              >
                {GRADIENT_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
              <input
                type="checkbox"
                id="bannerActive"
                checked={editBanner.isActive}
                onChange={(e) => setEditBanner((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="bannerActive" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                Active (display on website homepage)
              </label>
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
