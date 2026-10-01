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
  const [announcements, setAnnouncements] = useState([]);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productGalleryOpen, setProductGalleryOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quickImageBanner, setQuickImageBanner] = useState(null); // For direct "Change Image" click on a card
  // Custom gradient mode for banner color picker
  const [useCustomGradient, setUseCustomGradient] = useState(false);
  const [customGradientInput, setCustomGradientInput] = useState("");

  // Featured sections state
  const [featuredSections, setFeaturedSections] = useState([]);
  const [editFeatured, setEditFeatured] = useState(null);
  const [isAddingFeatured, setIsAddingFeatured] = useState(false);
  const [featuredProductSearch, setFeaturedProductSearch] = useState("");

  const fileInputRef = useRef(null);
  const quickFileInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
    fetchAnnouncements();
    fetchFeaturedSections();
    fetchStoreProducts();
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

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_URL}/api/cms/announcements`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAnnouncements(data);
      }
    } catch (err) {
      console.warn("Could not load announcements:", err);
    }
  }

  async function toggleAnnouncement(id) {
    try {
      const res = await fetch(`${API_URL}/api/cms/announcements/${id}/toggle`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        // Only one can be active — update full list from backend response
        setAnnouncements((prev) => prev.map((a) => ({ ...a, isActive: a.id === data.announcement.id ? data.announcement.isActive : false })));
      }
      flashSaved();
    } catch (err) {
      console.error("Failed to toggle announcement:", err);
    }
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement bar?")) return;
    try {
      await fetch(`${API_URL}/api/cms/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      flashSaved();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  }

  async function saveAnnouncement(ann) {
    try {
      const isNew = !ann.id || String(ann.id).startsWith("new");
      const url = isNew ? `${API_URL}/api/cms/announcements` : `${API_URL}/api/cms/announcements/${ann.id}`;
      const method = isNew ? "POST" : "PUT";
      const body = {
        text: ann.text,
        badge: ann.badge || "",
        link: ann.link || "/deals",
        ctaText: ann.ctaText || "Shop Now",
        icon: ann.icon || "🎉",
        image: ann.image || "",
        bgColor: ann.bgColor || "linear-gradient(90deg, #15803d, #22c55e)",
        textColor: ann.textColor || "#ffffff",
        isActive: ann.isActive || false,
        order: ann.order || 1,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setEditAnnouncement(null);
        setIsAddingAnnouncement(false);
        flashSaved();
      }
    } catch (err) {
      console.error("Failed to save announcement:", err);
    }
  }

  async function fetchFeaturedSections() {
    try {
      const res = await fetch(`${API_URL}/api/cms/featured-sections`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setFeaturedSections(data);
      }
    } catch (err) {
      console.warn("Could not load featured sections:", err);
    }
  }

  async function toggleFeaturedSection(id) {
    try {
      const res = await fetch(`${API_URL}/api/cms/featured-sections/${id}/toggle`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setFeaturedSections((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: data.section.isActive } : s))
        );
        flashSaved();
      }
    } catch (err) {
      console.error("Failed to toggle featured section:", err);
    }
  }

  async function deleteFeaturedSection(id) {
    if (!window.confirm("Are you sure you want to delete this featured section?")) return;
    try {
      const res = await fetch(`${API_URL}/api/cms/featured-sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeaturedSections((prev) => prev.filter((s) => s.id !== id));
        flashSaved();
      }
    } catch (err) {
      console.error("Failed to delete featured section:", err);
    }
  }

  async function saveFeaturedSection(sectionData) {
    try {
      const isNew = !sectionData.id || String(sectionData.id).startsWith("new");
      const url = isNew
        ? `${API_URL}/api/cms/featured-sections`
        : `${API_URL}/api/cms/featured-sections/${sectionData.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (res.ok) {
        await fetchFeaturedSections();
        setEditFeatured(null);
        setIsAddingFeatured(false);
        flashSaved();
      }
    } catch (err) {
      console.error("Failed to save featured section:", err);
    }
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

      {/* MODERN INTERACTIVE TABS */}
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-white/10 rounded-xl mb-6 w-fit border border-gray-200/50 dark:border-white/10 shadow-xs">
        {[
          { id: "banners", label: "Hero Banners", count: banners.length, icon: "🖼️" },
          { id: "announcements", label: "Announcement Bar", count: announcements.length, icon: "📢" },
          { id: "featured", label: "Featured Section", count: featuredSections.length, icon: "⚡" },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span
                className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
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
        <div style={{ display: "grid", gap: "16px" }}>
          {/* Add New Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
              {announcements.length} announcement bar{announcements.length !== 1 ? "s" : ""}. Only 1 can be active at a time.
            </span>
            <button
              onClick={() => {
                setEditAnnouncement({
                  id: `new_${Date.now()}`,
                  text: "",
                  badge: "",
                  link: "/deals",
                  ctaText: "Shop Now",
                  icon: "🎉",
                  image: "",
                  bgColor: "linear-gradient(90deg, #15803d, #22c55e)",
                  textColor: "#ffffff",
                  isActive: false,
                  order: (announcements.length || 0) + 1,
                });
                setIsAddingAnnouncement(true);
              }}
              style={{ padding: "9px 18px", background: "#4CAF37", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              + Add Announcement
            </button>
          </div>

          {announcements.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: "#fff", borderRadius: "12px", border: "1px dashed #e2e8f0" }}>
              No announcement bars yet. Click "Add Announcement" to create one.
            </div>
          )}

          {announcements.map((ann) => (
            <div
              key={ann.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: `1px solid ${ann.isActive ? "#86efac" : "#e2e8f0"}`,
                overflow: "hidden",
                boxShadow: ann.isActive ? "0 0 0 2px rgba(34,197,94,0.1)" : "none",
              }}
            >
              {/* Preview bar */}
              <div
                style={{
                  background: ann.bgColor || "linear-gradient(90deg, #15803d, #22c55e)",
                  color: ann.textColor || "#fff",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {ann.badge && (
                  <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "20px", padding: "2px 10px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                    {ann.badge}
                  </span>
                )}
                {ann.icon && <span>{ann.icon}</span>}
                <span>{ann.text || "(No text yet)"}</span>
                {ann.ctaText && (
                  <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: "5px", padding: "3px 12px", fontSize: "11px", cursor: "default" }}>
                    {ann.ctaText} →
                  </span>
                )}
              </div>
              {/* Actions row */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, fontSize: "12px", color: ann.isActive ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>
                  {ann.isActive ? "● Currently Active on Store" : "○ Inactive"}
                </div>
                <button
                  onClick={() => { setEditAnnouncement({ ...ann }); setIsAddingAnnouncement(false); }}
                  style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#f8fafc", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => toggleAnnouncement(ann.id)}
                  style={{ padding: "6px 16px", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: 600, fontSize: "12px", background: ann.isActive ? "#fef2f2" : "#ecfdf5", color: ann.isActive ? "#ef4444" : "#10b981" }}
                >
                  {ann.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  style={{ padding: "6px 10px", border: "1px solid #fee2e2", borderRadius: "7px", background: "#fef2f2", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#ef4444" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANNOUNCEMENT EDIT / ADD MODAL */}
      {editAnnouncement && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{isAddingAnnouncement ? "Add Announcement Bar" : "Edit Announcement Bar"}</h3>
              <button onClick={() => { setEditAnnouncement(null); setIsAddingAnnouncement(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Live Preview */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>Live Preview:</label>
                <div style={{ background: editAnnouncement.bgColor || "linear-gradient(90deg, #15803d, #22c55e)", color: editAnnouncement.textColor || "#fff", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {editAnnouncement.badge && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "20px", padding: "2px 10px", fontSize: "10px" }}>{editAnnouncement.badge}</span>}
                  {editAnnouncement.icon && <span>{editAnnouncement.icon}</span>}
                  <span>{editAnnouncement.text || "Your announcement text here..."}</span>
                  {editAnnouncement.ctaText && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: "5px", padding: "3px 12px", fontSize: "11px" }}>{editAnnouncement.ctaText} →</span>}
                </div>
              </div>

              {[{ label: "Announcement Text *", key: "text", placeholder: "e.g. 🎉 Free Shipping on orders above ₹999" },
                { label: "Badge Label", key: "badge", placeholder: "e.g. LIMITED OFFER" },
                { label: "Icon / Emoji", key: "icon", placeholder: "e.g. 🎉 or ⚡ or 🔥" },
                { label: "CTA Button Text", key: "ctaText", placeholder: "e.g. Shop Now" },
                { label: "CTA Link", key: "link", placeholder: "e.g. /deals" },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>{f.label}</label>
                  <input
                    value={editAnnouncement[f.key] || ""}
                    onChange={(e) => setEditAnnouncement((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              {/* Background Color */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Background Color / Gradient</label>
                <input
                  value={editAnnouncement.bgColor || ""}
                  onChange={(e) => setEditAnnouncement((p) => ({ ...p, bgColor: e.target.value }))}
                  placeholder="e.g. linear-gradient(90deg, #15803d, #22c55e) or #16a34a"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                />
                {/* Quick color swatches */}
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                  {[
                    { label: "Green", v: "linear-gradient(90deg, #15803d, #22c55e)" },
                    { label: "Red", v: "linear-gradient(90deg, #b91c1c, #ef4444)" },
                    { label: "Blue", v: "linear-gradient(90deg, #1d4ed8, #3b82f6)" },
                    { label: "Purple", v: "linear-gradient(90deg, #7c3aed, #a855f7)" },
                    { label: "Orange", v: "linear-gradient(90deg, #c2410c, #f97316)" },
                    { label: "Teal", v: "linear-gradient(90deg, #0f766e, #14b8a6)" },
                    { label: "Rose", v: "linear-gradient(90deg, #be185d, #f43f5e)" },
                    { label: "Dark", v: "linear-gradient(90deg, #111827, #374151)" },
                    { label: "Gold", v: "linear-gradient(90deg, #92400e, #f59e0b)" },
                    { label: "Cyan", v: "linear-gradient(90deg, #0369a1, #06b6d4)" },
                  ].map((sw) => (
                    <button
                      key={sw.v}
                      type="button"
                      title={sw.label}
                      onClick={() => setEditAnnouncement((p) => ({ ...p, bgColor: sw.v }))}
                      style={{ width: "28px", height: "20px", borderRadius: "4px", background: sw.v, border: editAnnouncement.bgColor === sw.v ? "2px solid #22c55e" : "2px solid transparent", cursor: "pointer" }}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Text Color</label>
                  <input
                    type="color"
                    value={editAnnouncement.textColor || "#ffffff"}
                    onChange={(e) => setEditAnnouncement((p) => ({ ...p, textColor: e.target.value }))}
                    style={{ width: "60px", height: "36px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer", padding: "2px" }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", paddingTop: "18px" }}>
                  <input type="checkbox" id="annActive" checked={editAnnouncement.isActive} onChange={(e) => setEditAnnouncement((p) => ({ ...p, isActive: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "#4CAF37", cursor: "pointer" }} />
                  <label htmlFor="annActive" style={{ fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>Set as Active</label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => { setEditAnnouncement(null); setIsAddingAnnouncement(false); }} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>Cancel</button>
                <button onClick={() => saveAnnouncement(editAnnouncement)} style={{ padding: "10px 24px", background: "#4CAF37", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>💾 Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURED SECTION TAB */}
      {activeTab === "featured" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Featured Sections</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                  Live on Homepage
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Customize featured titles, badges, and choose exactly which products appear on the storefront.
              </p>
            </div>
            <button
              onClick={() => {
                setEditFeatured({
                  id: `new_${Date.now()}`,
                  title: "Trending Supplements",
                  subtitle: "Best-selling formulas handpicked for maximum performance",
                  badge: "HOT DEALS",
                  productIds: [],
                  category: "All",
                  layoutType: "carousel",
                  maxItems: 8,
                  isActive: true,
                  order: (featuredSections.length || 0) + 1,
                });
                setIsAddingFeatured(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer self-start sm:self-auto"
            >
              <FiPlus size={16} /> Add Featured Section
            </button>
          </div>

          {featuredSections.length === 0 && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <FiLayout size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">No Featured Sections Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                Create a featured section to showcase top products on the homepage.
              </p>
              <button
                onClick={() => {
                  setEditFeatured({
                    id: `new_${Date.now()}`,
                    title: "Featured Supplements",
                    subtitle: "Handpicked performance supplements crafted for real results",
                    badge: "TOP PICKS",
                    productIds: [],
                    category: "All",
                    layoutType: "carousel",
                    maxItems: 8,
                    isActive: true,
                    order: 1,
                  });
                  setIsAddingFeatured(true);
                }}
                className="px-4 py-2 bg-[#4CAF37] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Create First Section
              </button>
            </div>
          )}

          <div className="grid gap-4">
            {featuredSections.map((sec) => (
              <div
                key={sec.id}
                className={`bg-white dark:bg-white/5 rounded-2xl border transition-all p-5 shadow-xs ${
                  sec.isActive
                    ? "border-emerald-200 dark:border-emerald-800/40"
                    : "border-gray-100 dark:border-white/10 opacity-75"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {sec.badge && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider">
                          {sec.badge}
                        </span>
                      )}
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                        {sec.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md font-semibold capitalize">
                        {sec.layoutType || "grid"} layout
                      </span>
                    </div>

                    {sec.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {sec.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>
                        📦{" "}
                        <strong className="text-gray-800 dark:text-white">
                          {sec.productIds?.length || 0}
                        </strong>{" "}
                        Products Selected (Max: {sec.maxItems || 8})
                      </span>
                      {sec.category && sec.category !== "All" && (
                        <span>🏷️ Category: <strong className="text-gray-800 dark:text-white">{sec.category}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => toggleFeaturedSection(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        sec.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {sec.isActive ? "● Active on Store" : "○ Hidden"}
                    </button>

                    <button
                      onClick={() => {
                        setEditFeatured({ ...sec });
                        setIsAddingFeatured(false);
                      }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiEdit2 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => deleteFeaturedSection(sec.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT FEATURED SECTION MODAL */}
      {editFeatured && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {isAddingFeatured ? "Create Featured Section" : "Edit Featured Section"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure titles, layouts, and choose products to display.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditFeatured(null);
                  setIsAddingFeatured(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Section Title *
                  </label>
                  <input
                    value={editFeatured.title || ""}
                    onChange={(e) => setEditFeatured((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Best Sellers or Trending Supplements"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    value={editFeatured.badge || ""}
                    onChange={(e) => setEditFeatured((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. TOP PICKS, 30% OFF, MUST BUY"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subtitle / Description
                </label>
                <input
                  value={editFeatured.subtitle || ""}
                  onChange={(e) => setEditFeatured((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="e.g. Handpicked performance supplements crafted for real results"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Display Layout
                  </label>
                  <select
                    value={editFeatured.layoutType || "carousel"}
                    onChange={(e) => setEditFeatured((p) => ({ ...p, layoutType: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="carousel">Carousel (Slider)</option>
                    <option value="grid">Responsive Grid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Max Products to Show
                  </label>
                  <select
                    value={editFeatured.maxItems || 8}
                    onChange={(e) => setEditFeatured((p) => ({ ...p, maxItems: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value={4}>4 Products</option>
                    <option value={6}>6 Products</option>
                    <option value={8}>8 Products</option>
                    <option value={12}>12 Products</option>
                    <option value={16}>16 Products</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="secIsActive"
                    checked={editFeatured.isActive ?? true}
                    onChange={(e) => setEditFeatured((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="secIsActive" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Show on Storefront
                  </label>
                </div>
              </div>

              {/* Product Selection List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                    <span>Select Products</span>
                    <span className="text-[11px] font-normal text-gray-500">
                      ({editFeatured.productIds?.length || 0} selected)
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = storeProducts.map((p) => p.id);
                        setEditFeatured((p) => ({ ...p, productIds: allIds }));
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditFeatured((p) => ({ ...p, productIds: [] }))}
                      className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search in products */}
                <input
                  type="text"
                  placeholder="Search products to add..."
                  value={featuredProductSearch}
                  onChange={(e) => setFeaturedProductSearch(e.target.value)}
                  className="w-full px-3 py-1.5 mb-2.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none"
                />

                <div className="border border-gray-200 dark:border-white/10 rounded-xl max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                  {storeProducts
                    .filter((p) =>
                      !featuredProductSearch ||
                      p.name?.toLowerCase().includes(featuredProductSearch.toLowerCase()) ||
                      p.category?.toLowerCase().includes(featuredProductSearch.toLowerCase())
                    )
                    .map((p) => {
                      const isSelected = editFeatured.productIds?.includes(p.id) || editFeatured.productIds?.includes(Number(p.id));
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            const current = editFeatured.productIds || [];
                            const next = isSelected
                              ? current.filter((id) => id !== p.id && id !== Number(p.id))
                              : [...current, p.id];
                            setEditFeatured((prev) => ({ ...prev, productIds: next }));
                          }}
                          className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-emerald-50/80 dark:bg-emerald-950/40"
                              : "hover:bg-gray-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 accent-emerald-600 pointer-events-none"
                          />
                          <img
                            src={p.image ? (p.image.startsWith("http") ? p.image : `${API_URL}${p.image}`) : "https://placehold.co/50x50"}
                            alt=""
                            className="w-9 h-9 object-contain rounded bg-white p-1 border border-gray-200/60 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {p.category || "General"} • ₹{p.price}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {storeProducts.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-400">
                      Loading products...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2.5 bg-gray-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setEditFeatured(null);
                  setIsAddingFeatured(false);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveFeaturedSection(editFeatured)}
                className="px-5 py-2 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-lg text-xs font-bold shadow-xs hover:shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <FiCheck size={14} /> Save Section
              </button>
            </div>
          </div>
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  Color Theme / Background Gradient
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !useCustomGradient;
                    setUseCustomGradient(next);
                    if (next) {
                      const current = editBanner.bgGradient || "";
                      const isCustom = current.startsWith("linear-gradient") || current.startsWith("#") || current.startsWith("rgb");
                      setCustomGradientInput(isCustom ? current : "linear-gradient(135deg, #4f46e5, #7e22ce)");
                    }
                  }}
                  style={{ fontSize: "11px", color: useCustomGradient ? "#4CAF37" : "#6366f1", background: "none", border: "1px solid currentColor", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}
                >
                  {useCustomGradient ? "← Back to Presets" : "Custom CSS Gradient"}
                </button>
              </div>

              {useCustomGradient ? (
                <div>
                  <input
                    type="text"
                    value={customGradientInput}
                    onChange={(e) => {
                      setCustomGradientInput(e.target.value);
                      setEditBanner((prev) => ({ ...prev, bgGradient: e.target.value }));
                    }}
                    placeholder="e.g. linear-gradient(135deg, #ff6b6b, #feca57) or #ff6b6b"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #6366f1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                  {/* Live preview */}
                  {customGradientInput && (
                    <div style={{
                      marginTop: "8px",
                      height: "40px",
                      borderRadius: "8px",
                      background: customGradientInput,
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      color: "#fff",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)"
                    }}>
                      Live Preview ✓
                    </div>
                  )}
                  {/* Quick color palette swatches */}
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", fontWeight: 600 }}>Quick Palettes:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {[
                        { label: "Ocean", v: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
                        { label: "Sunset", v: "linear-gradient(135deg, #f97316, #dc2626)" },
                        { label: "Forest", v: "linear-gradient(135deg, #16a34a, #15803d)" },
                        { label: "Midnight", v: "linear-gradient(135deg, #1e1b4b, #312e81)" },
                        { label: "Rose Gold", v: "linear-gradient(135deg, #f43f5e, #fb923c)" },
                        { label: "Aurora", v: "linear-gradient(135deg, #8b5cf6, #06b6d4)" },
                        { label: "Charcoal", v: "linear-gradient(135deg, #1f2937, #374151)" },
                        { label: "Lemon", v: "linear-gradient(135deg, #ca8a04, #f59e0b)" },
                        { label: "Crimson", v: "linear-gradient(135deg, #9f1239, #be123c)" },
                        { label: "Teal Deep", v: "linear-gradient(135deg, #0f766e, #0d9488)" },
                      ].map((sw) => (
                        <button
                          key={sw.v}
                          type="button"
                          title={sw.label}
                          onClick={() => {
                            setCustomGradientInput(sw.v);
                            setEditBanner((prev) => ({ ...prev, bgGradient: sw.v }));
                          }}
                          style={{
                            width: "36px",
                            height: "24px",
                            borderRadius: "5px",
                            background: sw.v,
                            border: customGradientInput === sw.v ? "2px solid #22c55e" : "2px solid transparent",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
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
