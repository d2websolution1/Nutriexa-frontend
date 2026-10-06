import { useState } from "react";
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiSave,
  FiGlobe,
  FiClock,
} from "react-icons/fi";

const INITIAL_PAGES = [
  {
    id: 1,
    title: "About Us",
    slug: "about",
    content: `<h2>About Nutriexa</h2><p>Nutriexa is India's premium nutrition brand dedicated to providing the highest quality supplements for fitness enthusiasts. Founded with a passion for sports nutrition, we source only the finest ingredients to fuel your performance.</p><p>Our mission is to make premium nutrition accessible to every Indian athlete, from beginners to professional bodybuilders.</p>`,
    status: "Published",
    updatedAt: "2024-05-10T10:00:00Z",
  },
  {
    id: 2,
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: `<h2>Privacy Policy</h2><p>At Nutriexa, we are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you shop with us.</p><p>We collect information such as your name, email, phone number, and shipping address only to process your orders and improve your experience.</p>`,
    status: "Published",
    updatedAt: "2024-04-22T14:30:00Z",
  },
  {
    id: 3,
    title: "Terms & Conditions",
    slug: "terms",
    content: `<h2>Terms & Conditions</h2><p>By using the Nutriexa website, you agree to the following terms and conditions. Please read them carefully before making a purchase.</p><p>All products sold are subject to availability. We reserve the right to cancel orders in cases of stock unavailability or pricing errors.</p>`,
    status: "Published",
    updatedAt: "2024-04-22T14:30:00Z",
  },
  {
    id: 4,
    title: "FAQ",
    slug: "faq",
    content: `<h2>Frequently Asked Questions</h2><p><strong>Q: Are your products authentic?</strong><br/>A: Yes, all Nutriexa products are 100% authentic with QR-based verification.</p><p><strong>Q: What is your return policy?</strong><br/>A: We offer a 7-day return policy for unopened products in original packaging.</p>`,
    status: "Published",
    updatedAt: "2024-05-01T09:00:00Z",
  },
  {
    id: 5,
    title: "Refund Policy",
    slug: "refund-policy",
    content: `<h2>Refund Policy</h2><p>We accept returns within 7 days of delivery for unused products in original packaging. Refunds are processed within 5-7 business days to the original payment method.</p>`,
    status: "Draft",
    updatedAt: "2024-05-15T16:00:00Z",
  },
  {
    id: 6,
    title: "Shipping Policy",
    slug: "shipping-policy",
    content: `<h2>Shipping Policy</h2><p>We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for select pin codes at an additional charge.</p>`,
    status: "Published",
    updatedAt: "2024-03-18T11:00:00Z",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function ContentPages() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [editPage, setEditPage] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);
  const [saved, setSaved] = useState(false);

  const newPageTemplate = {
    id: Date.now(),
    title: "",
    slug: "",
    content: "<h2>Page Title</h2><p>Write your content here...</p>",
    status: "Draft",
    updatedAt: new Date().toISOString(),
  };

  function savePage(data) {
    const now = new Date().toISOString();
    if (isAdding) {
      setPages((prev) => [...prev, { ...data, id: Date.now(), updatedAt: now }]);
      setIsAdding(false);
    } else {
      setPages((prev) => prev.map((p) => (p.id === data.id ? { ...data, updatedAt: now } : p)));
    }
    setEditPage(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function deletePage(id) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleStatus(id) {
    setPages((prev) => prev.map((p) => p.id === id
      ? { ...p, status: p.status === "Published" ? "Draft" : "Published" }
      : p
    ));
  }

  function autoSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FiFileText className="text-indigo-500" /> Content / Pages
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage static pages like About Us, Privacy Policy, Terms, FAQs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {saved && (
            <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-semibold text-xs sm:text-sm">
              ✓ Saved!
            </div>
          )}
          <button
            onClick={() => { setEditPage(newPageTemplate); setIsAdding(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer"
          >
            <FiPlus size={16} /> Add Page
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white dark:bg-[#111722] border border-gray-200/80 dark:border-white/5 rounded-2xl p-5 shadow-xs transition hover:border-gray-300 dark:hover:border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white text-base truncate">{page.title}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <FiGlobe size={11} className="shrink-0" /> /{page.slug}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                  page.status === "Published"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10"
                }`}>
                  {page.status}
                </span>
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-5">
                <FiClock size={11} className="shrink-0" /> Last updated: {formatDate(page.updatedAt)}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setPreviewPage(page)}
                className="flex-1 py-1.5 px-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 transition"
              >
                <FiEye size={12} /> Preview
              </button>
              <button
                onClick={() => { setEditPage({ ...page }); setIsAdding(false); }}
                className="flex-1 py-1.5 px-2 border border-indigo-200 dark:border-indigo-800/60 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 transition"
              >
                <FiEdit2 size={12} /> Edit
              </button>
              <button
                onClick={() => toggleStatus(page.id)}
                className={`flex-1 py-1.5 px-2 border rounded-lg text-xs font-semibold cursor-pointer transition ${
                  page.status === "Published"
                    ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                    : "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                {page.status === "Published" ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => deletePage(page.id)}
                className="p-1.5 border border-rose-200 dark:border-rose-900/50 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 cursor-pointer transition"
                title="Delete Page"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {isAdding ? "Add New Page" : "Edit Page"}
              </h2>
              <button
                onClick={() => { setEditPage(null); setIsAdding(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Page Title *
                </label>
                <input
                  value={editPage.title}
                  onChange={(e) => setEditPage((prev) => ({
                    ...prev, title: e.target.value,
                    slug: isAdding ? autoSlug(e.target.value) : prev.slug
                  }))}
                  placeholder="e.g. About Us"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-400 text-xs sm:text-sm border-r border-gray-200 dark:border-white/10">
                    /
                  </span>
                  <input
                    value={editPage.slug}
                    onChange={(e) => setEditPage((prev) => ({ ...prev, slug: autoSlug(e.target.value) }))}
                    placeholder="about-us"
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Content (HTML supported)
                </label>
                <textarea
                  rows={8}
                  value={editPage.content}
                  onChange={(e) => setEditPage((prev) => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="publishStatus"
                  checked={editPage.status === "Published"}
                  onChange={(e) => setEditPage((prev) => ({ ...prev, status: e.target.checked ? "Published" : "Draft" }))}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="publishStatus" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Publish this page
                </label>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => { setEditPage(null); setIsAdding(false); }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => savePage(editPage)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-sm"
              >
                <FiSave size={15} /> Save Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{previewPage.title}</h2>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/{previewPage.slug}</div>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <div
              className="p-5 sm:p-6 overflow-y-auto leading-relaxed text-gray-800 dark:text-gray-200 text-sm prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewPage.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
