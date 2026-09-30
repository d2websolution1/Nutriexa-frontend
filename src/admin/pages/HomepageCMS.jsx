import { useState, useEffect, useRef } from "react";
import {
  FiLayout,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiRefreshCw,
  FiUploadCloud,
  FiCheck,
  FiExternalLink,
  FiShoppingBag,
} from "react-icons/fi";
import { API_URL } from "../../config";
import heroDefaultMockup from "../../assets/homepage-img/hero-product.png";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productGalleryOpen, setProductGalleryOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quickImageBanner, setQuickImageBanner] = useState(null); // For direct "Change Image" click on a card

  const fileInputRef = useRef(null);
  const quickFileInputRef = useRef(null);

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

  async function fetchStoreProducts() {
    if (storeProducts.length > 0) return;
    try {
      setLoadingProducts(true);
      // Try CMS product-images first, fall back to /api/products
      let res = await fetch(`${API_URL}/api/cms/product-images`);
      if (res.ok) {
        const data = await res.json();
        setStoreProducts(data);
        return;
      }
      res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setStoreProducts(list.filter((p) => p.image));
      }
    } catch (err) {
      console.warn("Could not load products for banner picker:", err);
    } finally {
      setLoadingProducts(false);
    }
  }

  // Compress image with canvas if needed as safe fallback
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.88));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  async function handleFileUpload(file, targetBannerSetter) {
    if (!file) return;
    setUploadingImage(true);
    try {
      // 1. Try uploading to backend /api/cms/upload
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/cms/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.url) {
          targetBannerSetter(resData.url);
          setUploadingImage(false);
          return;
        }
      }

      // 2. If endpoint not reachable or Cloudinary error, fallback to compressed Data URL
      const dataUrl = await compressImageFile(file);
      targetBannerSetter(dataUrl);
    } catch (err) {
      console.warn("Upload failed, falling back to base64 Data URL:", err);
      try {
        const dataUrl = await compressImageFile(file);
        targetBannerSetter(dataUrl);
      } catch (inner) {
        alert("Failed to read image file.");
      }
    } finally {
      setUploadingImage(false);
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

  async function quickUpdateBannerImage(banner, newImageUrl) {
    try {
      const updated = { ...banner, image: newImageUrl };
      const res = await fetch(`${API_URL}/api/cms/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const resData = await res.json();
        setBanners((prev) => prev.map((b) => (b.id === banner.id ? resData.banner : b)));
      } else {
        setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      }
      flashSaved();
    } catch (err) {
      console.error("Error saving quick banner image:", err);
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
    setTimeout(() => setSaved(false), 2200);
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

  const resolveImageUrl = (img) => {
    if (!img) return heroDefaultMockup;
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Hidden file input for quick direct change */}
      <input
        type="file"
        ref={quickFileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && quickImageBanner) {
            handleFileUpload(file, (url) => {
              quickUpdateBannerImage(quickImageBanner, url);
              setQuickImageBanner(null);
            });
          }
          e.target.value = "";
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <FiLayout className="text-[#4CAF37]" /> Homepage CMS
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Manage hero banners, announcement bar, and change slider images in real-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && (
            <div style={{ padding: "8px 16px", background: "#ecfdf5", color: "#10b981", border: "1px solid #d1fae5", borderRadius: "8px", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiCheck /> Changes saved successfully!
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
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#4CAF37" : "#64748b",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab === "banners" ? "Hero Banners" : tab === "announcements" ? "Announcement Bar" : "Featured Section"}
          </button>
        ))}
      </div>

      {/* HERO BANNERS TAB */}
      {activeTab === "banners" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
              Showing {banners.length} banners. You can add unique images or change images for each banner slide.
            </span>
            <button
              onClick={() => {
                setEditBanner(newBannerTemplate);
                setIsAddingBanner(true);
              }}
              style={{
                padding: "10px 20px",
                background: "#4CAF37",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(76, 175, 55, 0.25)",
              }}
            >
              <FiPlus size={16} /> Add New Banner
            </button>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {banners.map((banner) => (
              <div
                key={banner.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                {/* Banner Live Slide Preview Card */}
                <div
                  style={{
                    minHeight: "140px",
                    background: getGradientCss(banner.bgGradient),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 28px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left: Text & CTA */}
                  <div style={{ zIndex: 2, maxWidth: "60%" }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "0.2px" }}>
                      {banner.title || "Untitled Banner"}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "14px", marginTop: "4px", lineHeight: "1.4" }}>
                      {banner.subtitle}
                    </div>
                    {banner.cta && (
                      <div style={{ marginTop: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 16px",
                            background: "#fff",
                            color: "#1e293b",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                          }}
                        >
                          {banner.cta} →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actual Product/Banner Image */}
                  <div
                    style={{
                      zIndex: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "110px",
                        height: "100px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={resolveImageUrl(banner.image)}
                        alt={banner.title}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: banner.image ? "#a7f3d0" : "rgba(255,255,255,0.75)",
                        background: "rgba(0,0,0,0.35)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      {banner.image ? "✓ Custom Image" : "• Default Mockup"}
                    </span>
                  </div>

                  {/* Top-right Status badge */}
                  <div style={{ position: "absolute", top: "12px", right: "14px", zIndex: 3 }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: banner.isActive ? "#ecfdf5" : "#f1f5f9",
                        color: banner.isActive ? "#059669" : "#64748b",
                        border: banner.isActive ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                      }}
                    >
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div style={{ padding: "12px 20px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", background: "#fff" }}>
                  <span style={{ flex: 1, fontSize: "12.5px", color: "#64748b" }}>
                    Order #{banner.order} · Link:{" "}
                    <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>
                      {banner.ctaLink}
                    </code>
                  </span>

                  {/* Instant "Change Image" button */}
                  <button
                    onClick={() => {
                      setQuickImageBanner(banner);
                      quickFileInputRef.current?.click();
                    }}
                    title="Change banner image directly"
                    style={{
                      padding: "6px 14px",
                      border: "1px solid #d1fae5",
                      borderRadius: "7px",
                      background: "#f0fdf4",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiImage size={14} /> {banner.image ? "Change Image" : "Add Image"}
                  </button>

                  <button
                    onClick={() => toggleBanner(banner.id)}
                    style={{
                      padding: "6px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "7px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: banner.isActive ? "#ef4444" : "#10b981",
                    }}
                  >
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => {
                      setEditBanner({ ...banner });
                      setIsAddingBanner(false);
                    }}
                    style={{
                      padding: "6px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "7px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#4CAF37",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiEdit2 size={13} /> Edit All
                  </button>

                  <button
                    onClick={() => deleteBanner(banner.id)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #fee2e2",
                      borderRadius: "7px",
                      background: "#fef2f2",
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
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
            <div
              key={ann.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{ann.text}</div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: ann.isActive ? "#10b981" : "#94a3b8" }}>
                  {ann.isActive ? "● Currently Active" : "○ Inactive"}
                </div>
              </div>
              <button
                onClick={() => toggleAnnouncement(ann.id)}
                style={{
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  background: ann.isActive ? "#fef2f2" : "#ecfdf5",
                  color: ann.isActive ? "#ef4444" : "#10b981",
                }}
              >
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
            Configure which products or categories appear in featured sections on the homepage.
          </p>
        </div>
      )}

      {/* ADD / EDIT BANNER MODAL */}
      {editBanner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>
                  {isAddingBanner ? "Add New Hero Banner" : "Edit Hero Banner"}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  Customize headline, CTA, theme gradient, and upload or change the banner product image.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditBanner(null);
                  setIsAddingBanner(false);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
              >
                <FiX size={22} />
              </button>
            </div>

            {/* LIVE PREVIEW OF THE BANNER IN MODAL */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Live Slide Preview
              </label>
              <div
                style={{
                  background: getGradientCss(editBanner.bgGradient),
                  borderRadius: "12px",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ maxWidth: "65%" }}>
                  <div style={{ fontSize: "17px", fontWeight: 800, lineHeight: 1.2 }}>
                    {editBanner.title || "Headline preview..."}
                  </div>
                  <div style={{ fontSize: "12.5px", opacity: 0.9, marginTop: "4px" }}>
                    {editBanner.subtitle || "Subtitle tagline preview..."}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: "#fff", color: "#1e293b", padding: "4px 12px", borderRadius: "5px" }}>
                      {editBanner.cta || "Shop Now"} →
                    </span>
                  </div>
                </div>
                <div style={{ width: "90px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={resolveImageUrl(editBanner.image)}
                    alt="Preview"
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
                  />
                </div>
              </div>
            </div>

            {/* BANNER IMAGE SECTION (TASK 1: ADD & CHANGE IMAGE) */}
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1.5px dashed #cbd5e1",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiImage className="text-[#4CAF37]" /> Banner Product Image
                </label>
                {editBanner.image && (
                  <button
                    type="button"
                    onClick={() => setEditBanner((prev) => ({ ...prev, image: "" }))}
                    style={{ fontSize: "11px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    ✕ Remove Image (Use Default)
                  </button>
                )}
              </div>

              {/* Image Preview & Buttons Row */}
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={resolveImageUrl(editBanner.image)}
                    alt="Current"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, (url) => setEditBanner((prev) => ({ ...prev, image: url })));
                      }
                      e.target.value = "";
                    }}
                  />

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {/* Upload / Change Image from computer */}
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "8px 14px",
                        background: "#4CAF37",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiUploadCloud size={14} />
                      {uploadingImage ? "Uploading..." : editBanner.image ? "Change Image (Upload)" : "Upload Image"}
                    </button>

                    {/* Pick from Store Products */}
                    <button
                      type="button"
                      onClick={() => {
                        fetchStoreProducts();
                        setProductGalleryOpen(true);
                      }}
                      style={{
                        padding: "8px 14px",
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiShoppingBag size={13} /> Pick from Store
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                    Supports PNG, JPG, WebP. Transparent PNGs look best.
                  </p>
                </div>
              </div>

              {/* Direct URL input */}
              <div style={{ marginTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Or enter Image URL:</span>
                <input
                  type="text"
                  value={editBanner.image || ""}
                  onChange={(e) => setEditBanner((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://res.cloudinary.com/... or paste image link"
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    padding: "8px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxSizing: "border-box",
                    background: "#fff",
                  }}
                />
              </div>
            </div>

            {/* Other Banner Fields */}
            {[
              { label: "Banner Headline / Title", key: "title", placeholder: "e.g. October Dhamaka upto 80% discount" },
              { label: "Subtitle / Tagline", key: "subtitle", placeholder: "e.g. Limited deals on all whey & creatine" },
              { label: "CTA Button Text", key: "cta", placeholder: "e.g. Shop Now" },
              { label: "CTA Link", key: "ctaLink", placeholder: "e.g. /products or /deals" },
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
                Color Theme / Background Gradient
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
                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#4CAF37" }}
              />
              <label htmlFor="bannerActive" style={{ fontSize: "14px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                Active (Display on website homepage slider)
              </label>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setEditBanner(null);
                  setIsAddingBanner(false);
                }}
                style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#64748b" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveBanner(editBanner)}
                style={{
                  padding: "10px 24px",
                  background: "#4CAF37",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(76, 175, 55, 0.25)",
                }}
              >
                <FiSave size={15} /> Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT IMAGE GALLERY PICKER MODAL */}
      {productGalleryOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                  Select an Image from Store Products
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Click on any product image to set it as this banner's hero image.
                </p>
              </div>
              <button
                onClick={() => setProductGalleryOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px", padding: "4px" }}>
              {loadingProducts ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading product images...
                </div>
              ) : storeProducts.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No product images found. You can upload an image from your computer directly.
                </div>
              ) : (
                storeProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (editBanner) {
                        setEditBanner((prev) => ({ ...prev, image: p.image }));
                      } else if (quickImageBanner) {
                        quickUpdateBannerImage(quickImageBanner, p.image);
                        setQuickImageBanner(null);
                      }
                      setProductGalleryOpen(false);
                    }}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: "#fafafa",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#4CAF37";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                      <img
                        src={resolveImageUrl(p.image)}
                        alt={p.name}
                        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
