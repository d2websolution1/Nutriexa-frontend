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
    <div className="space-y-6 pb-8">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <FiLayout className="text-[#4CAF37]" /> Homepage CMS
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage hero banners, announcement bar, and change slider images in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {saved && (
            <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs">
              <FiCheck /> Changes saved successfully!
            </div>
          )}
          <button
            onClick={fetchBanners}
            title="Refresh"
            className="p-2 sm:px-3 sm:py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111722] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer text-gray-600 dark:text-gray-300 transition shadow-xs"
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* MODERN INTERACTIVE TABS */}
      <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
        <div className="inline-flex gap-1.5 p-1.5 bg-gray-100 dark:bg-white/10 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-xs whitespace-nowrap min-w-max">
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-sm"
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
      </div>

      {/* HERO BANNERS TAB */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing {banners.length} banners. You can add unique images or change images for each banner slide.
            </span>
            <button
              onClick={() => {
                setEditBanner(newBannerTemplate);
                setIsAddingBanner(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <FiPlus size={16} /> Add New Banner
            </button>
          </div>

          <div className="grid gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Banner Live Slide Preview Card */}
                <div
                  className="relative overflow-hidden p-4 sm:p-6 min-h-[140px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ background: getGradientCss(banner.bgGradient) }}
                >
                  {/* Left: Text & CTA */}
                  <div className="z-10 w-full sm:max-w-[62%] pr-14 sm:pr-0">
                    <div className="text-white font-extrabold text-base sm:text-xl tracking-tight leading-snug">
                      {banner.title || "Untitled Banner"}
                    </div>
                    <div className="text-white/85 text-xs sm:text-sm mt-1 leading-relaxed">
                      {banner.subtitle}
                    </div>
                    {banner.cta && (
                      <div className="mt-3">
                        <span className="inline-block px-3.5 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-xs">
                          {banner.cta} →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actual Product/Banner Image */}
                  <div className="z-10 flex sm:flex-col items-center justify-center gap-2 self-center sm:self-auto">
                    <div className="w-24 sm:w-28 h-20 sm:h-24 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={resolveImageUrl(banner.image)}
                        alt={banner.title}
                        className="max-w-full max-h-full object-contain drop-shadow-md"
                      />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-emerald-200">
                      {banner.image ? "✓ Custom Image" : "• Default Mockup"}
                    </span>
                  </div>

                  {/* Top-right Status badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      banner.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#111722] border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Order #{banner.order} · Link:{" "}
                    <code className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                      {banner.ctaLink}
                    </code>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Instant "Change Image" button */}
                    <button
                      onClick={() => {
                        setQuickImageBanner(banner);
                        quickFileInputRef.current?.click();
                      }}
                      title="Change banner image directly"
                      className="px-3 py-1.5 border border-emerald-200 dark:border-emerald-800/60 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer transition"
                    >
                      <FiImage size={13} /> {banner.image ? "Change Image" : "Add Image"}
                    </button>

                    <button
                      onClick={() => toggleBanner(banner.id)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition ${
                        banner.isActive
                          ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          : "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                      }`}
                    >
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => {
                        setEditBanner({ ...banner });
                        setIsAddingBanner(false);
                      }}
                      className="px-3 py-1.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <FiEdit2 size={13} /> Edit All
                    </button>

                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="p-1.5 border border-rose-200 dark:border-rose-900/50 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 cursor-pointer transition"
                      title="Delete Banner"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          {/* Add New Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <FiPlus size={16} /> Add Announcement
            </button>
          </div>

          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#111722] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-xs sm:text-sm">
              No announcement bars yet. Click "Add Announcement" to create one.
            </div>
          )}

          <div className="grid gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-white dark:bg-[#111722] rounded-2xl border overflow-hidden shadow-xs transition ${
                  ann.isActive
                    ? "border-emerald-300 dark:border-emerald-700/60 ring-2 ring-emerald-500/20"
                    : "border-gray-200/80 dark:border-white/5"
                }`}
              >
                {/* Preview bar */}
                <div
                  style={{
                    background: ann.bgColor || "linear-gradient(90deg, #15803d, #22c55e)",
                    color: ann.textColor || "#fff",
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 flex-wrap"
                >
                  {ann.badge && (
                    <span className="bg-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
                      {ann.badge}
                    </span>
                  )}
                  {ann.icon && <span>{ann.icon}</span>}
                  <span>{ann.text || "(No text yet)"}</span>
                  {ann.ctaText && (
                    <span className="ml-auto bg-white/20 rounded-md px-2.5 py-0.5 text-[11px]">
                      {ann.ctaText} →
                    </span>
                  )}
                </div>

                {/* Actions row */}
                <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#111722] border-t border-gray-100 dark:border-white/5">
                  <div className={`text-xs font-semibold ${ann.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {ann.isActive ? "● Currently Active on Store" : "○ Inactive"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditAnnouncement({ ...ann }); setIsAddingAnnouncement(false); }}
                      className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => toggleAnnouncement(ann.id)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition ${
                        ann.isActive
                          ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          : "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                      }`}
                    >
                      {ann.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-1.5 border border-rose-200 dark:border-rose-900/50 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 cursor-pointer transition"
                      title="Delete Announcement"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT EDIT / ADD MODAL */}
      {editAnnouncement && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {isAddingAnnouncement ? "Add Announcement Bar" : "Edit Announcement Bar"}
              </h3>
              <button
                onClick={() => { setEditAnnouncement(null); setIsAddingAnnouncement(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              {/* Live Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Live Preview:
                </label>
                <div
                  style={{
                    background: editAnnouncement.bgColor || "linear-gradient(90deg, #15803d, #22c55e)",
                    color: editAnnouncement.textColor || "#fff",
                  }}
                  className="rounded-xl p-3 text-xs sm:text-sm font-semibold flex items-center gap-2 flex-wrap shadow-xs"
                >
                  {editAnnouncement.badge && (
                    <span className="bg-white/25 rounded-full px-2 py-0.5 text-[10px]">
                      {editAnnouncement.badge}
                    </span>
                  )}
                  {editAnnouncement.icon && <span>{editAnnouncement.icon}</span>}
                  <span>{editAnnouncement.text || "Your announcement text here..."}</span>
                  {editAnnouncement.ctaText && (
                    <span className="ml-auto bg-white/20 rounded-md px-2 py-0.5 text-[11px]">
                      {editAnnouncement.ctaText} →
                    </span>
                  )}
                </div>
              </div>

              {[{ label: "Announcement Text *", key: "text", placeholder: "e.g. 🎉 Free Shipping on orders above ₹999" },
                { label: "Badge Label", key: "badge", placeholder: "e.g. LIMITED OFFER" },
                { label: "Icon / Emoji", key: "icon", placeholder: "e.g. 🎉 or ⚡ or 🔥" },
                { label: "CTA Button Text", key: "ctaText", placeholder: "e.g. Shop Now" },
                { label: "CTA Link", key: "link", placeholder: "e.g. /deals" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}
                  </label>
                  <input
                    value={editAnnouncement[f.key] || ""}
                    onChange={(e) => setEditAnnouncement((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              ))}

              {/* Background Color */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Background Color / Gradient
                </label>
                <input
                  value={editAnnouncement.bgColor || ""}
                  onChange={(e) => setEditAnnouncement((p) => ({ ...p, bgColor: e.target.value }))}
                  placeholder="e.g. linear-gradient(90deg, #15803d, #22c55e) or #16a34a"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
                {/* Quick color swatches */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
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
                      style={{ background: sw.v }}
                      className={`w-7 h-5 rounded cursor-pointer transition ${
                        editAnnouncement.bgColor === sw.v ? "ring-2 ring-emerald-500 scale-105" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="flex items-center gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={editAnnouncement.textColor || "#ffffff"}
                    onChange={(e) => setEditAnnouncement((p) => ({ ...p, textColor: e.target.value }))}
                    className="w-14 h-9 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer p-0.5 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="annActive"
                    checked={editAnnouncement.isActive}
                    onChange={(e) => setEditAnnouncement((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-[#4CAF37] cursor-pointer"
                  />
                  <label htmlFor="annActive" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Set as Active
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => { setEditAnnouncement(null); setIsAddingAnnouncement(false); }}
                  className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveAnnouncement(editAnnouncement)}
                  className="px-5 py-2 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5"
                >
                  💾 Save
                </button>
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
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                  {isAddingBanner ? "Add New Hero Banner" : "Edit Hero Banner"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Customize headline, CTA, theme gradient, and upload or change the banner product image.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditBanner(null);
                  setIsAddingBanner(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* LIVE PREVIEW OF THE BANNER IN MODAL */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Live Slide Preview
              </label>
              <div
                style={{ background: getGradientCss(editBanner.bgGradient) }}
                className="rounded-xl p-4 sm:p-5 flex items-center justify-between text-white shadow-md relative overflow-hidden"
              >
                <div className="max-w-[65%]">
                  <div className="text-sm sm:text-base font-extrabold leading-snug">
                    {editBanner.title || "Headline preview..."}
                  </div>
                  <div className="text-xs opacity-90 mt-1">
                    {editBanner.subtitle || "Subtitle tagline preview..."}
                  </div>
                  <div className="mt-2.5">
                    <span className="text-[11px] font-bold bg-white text-gray-900 px-3 py-1 rounded-md shadow-xs inline-block">
                      {editBanner.cta || "Shop Now"} →
                    </span>
                  </div>
                </div>
                <div className="w-20 h-18 sm:w-24 sm:h-20 flex items-center justify-center p-1 bg-white/10 backdrop-blur-xs rounded-lg border border-white/20">
                  <img
                    src={resolveImageUrl(editBanner.image)}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* BANNER IMAGE SECTION */}
            <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <FiImage className="text-[#4CAF37]" /> Banner Product Image
                </label>
                {editBanner.image && (
                  <button
                    type="button"
                    onClick={() => setEditBanner((prev) => ({ ...prev, image: "" }))}
                    className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                  >
                    ✕ Remove Image (Use Default)
                  </button>
                )}
              </div>

              {/* Image Preview & Buttons Row */}
              <div className="flex gap-3.5 items-center flex-wrap">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src={resolveImageUrl(editBanner.image)}
                    alt="Current"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
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

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FiUploadCloud size={14} />
                      {uploadingImage ? "Uploading..." : editBanner.image ? "Change Image (Upload)" : "Upload Image"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        fetchStoreProducts();
                        setProductGalleryOpen(true);
                      }}
                      className="px-3 py-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <FiShoppingBag size={13} /> Pick from Store
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Supports PNG, JPG, WebP. Transparent PNGs look best.
                  </p>
                </div>
              </div>

              {/* Direct URL input */}
              <div className="mt-3">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Or enter Image URL:</span>
                <input
                  type="text"
                  value={editBanner.image || ""}
                  onChange={(e) => setEditBanner((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://res.cloudinary.com/... or paste image link"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Other Banner Fields */}
            <div className="space-y-3.5 mb-5">
              {[
                { label: "Banner Headline / Title", key: "title", placeholder: "e.g. October Dhamaka upto 80% discount" },
                { label: "Subtitle / Tagline", key: "subtitle", placeholder: "e.g. Limited deals on all whey & creatine" },
                { label: "CTA Button Text", key: "cta", placeholder: "e.g. Shop Now" },
                { label: "CTA Link", key: "ctaLink", placeholder: "e.g. /products or /deals" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    value={editBanner[field.key] || ""}
                    onChange={(e) => setEditBanner((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>

            {/* Gradient Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                  className={`text-[11px] font-semibold border rounded-md px-2.5 py-1 cursor-pointer transition ${
                    useCustomGradient
                      ? "text-[#4CAF37] border-[#4CAF37] bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  }`}
                >
                  {useCustomGradient ? "← Back to Presets" : "Custom CSS Gradient"}
                </button>
              </div>

              {useCustomGradient ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customGradientInput}
                    onChange={(e) => {
                      setCustomGradientInput(e.target.value);
                      setEditBanner((prev) => ({ ...prev, bgGradient: e.target.value }));
                    }}
                    placeholder="e.g. linear-gradient(135deg, #ff6b6b, #feca57) or #ff6b6b"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-emerald-500 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none"
                  />
                  {customGradientInput && (
                    <div
                      style={{ background: customGradientInput }}
                      className="h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-[11px] text-white font-bold tracking-wide shadow-xs"
                    >
                      Live Preview ✓
                    </div>
                  )}
                  <div className="pt-1">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Quick Palettes:</p>
                    <div className="flex flex-wrap gap-1.5">
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
                          style={{ background: sw.v }}
                          className={`w-8 h-6 rounded-md cursor-pointer transition ${
                            customGradientInput === sw.v ? "ring-2 ring-emerald-500 scale-105" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  value={editBanner.bgGradient || "from-indigo-600 to-purple-700"}
                  onChange={(e) => setEditBanner((prev) => ({ ...prev, bgGradient: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none cursor-pointer"
                >
                  {GRADIENT_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value} className="bg-white dark:bg-[#111722] text-gray-900 dark:text-white">
                      {g.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-2.5 mb-5">
              <input
                type="checkbox"
                id="bannerActive"
                checked={editBanner.isActive}
                onChange={(e) => setEditBanner((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#4CAF37] cursor-pointer"
              />
              <label htmlFor="bannerActive" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                Active (Display on website homepage slider)
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEditBanner(null);
                  setIsAddingBanner(false);
                }}
                className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveBanner(editBanner)}
                className="px-5 py-2 bg-[#4CAF37] hover:bg-[#3e8e2e] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition flex items-center gap-1.5"
              >
                <FiSave size={15} /> Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT IMAGE GALLERY PICKER MODAL */}
      {productGalleryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Select an Image from Store Products
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Click on any product image to set it as this banner's hero image.
                </p>
              </div>
              <button
                onClick={() => setProductGalleryOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {loadingProducts ? (
                <div className="col-span-full text-center py-12 text-gray-400 text-xs sm:text-sm">
                  Loading product images...
                </div>
              ) : storeProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400 text-xs sm:text-sm">
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
                    className="border border-gray-200 dark:border-white/10 hover:border-[#4CAF37] dark:hover:border-[#4CAF37] rounded-xl p-3 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-2xs flex flex-col items-center"
                  >
                    <div className="h-20 w-full flex items-center justify-center mb-2">
                      <img
                        src={resolveImageUrl(p.image)}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate w-full">
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
