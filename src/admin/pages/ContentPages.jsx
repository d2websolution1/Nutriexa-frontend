import { useState } from "react";
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
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
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Content / Pages</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Manage static pages like About Us, Privacy Policy, Terms, FAQs.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && (
            <div style={{ padding: "9px 16px", background: "#ecfdf5", color: "#10b981", border: "1px solid #d1fae5", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
              ✓ Saved!
            </div>
          )}
          <button
            onClick={() => { setEditPage(newPageTemplate); setIsAdding(true); }}
            style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiPlus size={16} /> Add Page
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
        {pages.map((page) => (
          <div key={page.id} style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
            padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>{page.title}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <FiGlobe size={11} /> /{page.slug}
                </div>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                background: page.status === "Published" ? "#ecfdf5" : "#f1f5f9",
                color: page.status === "Published" ? "#10b981" : "#94a3b8",
              }}>
                {page.status}
              </span>
            </div>

            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
              <FiClock size={11} /> Last updated: {formatDate(page.updatedAt)}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setPreviewPage(page)}
                style={{ flex: 1, padding: "7px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <FiEye size={13} /> Preview
              </button>
              <button onClick={() => { setEditPage({ ...page }); setIsAdding(false); }}
                style={{ flex: 1, padding: "7px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <FiEdit2 size={13} /> Edit
              </button>
              <button onClick={() => toggleStatus(page.id)}
                style={{ flex: 1, padding: "7px", border: `1px solid ${page.status === "Published" ? "#fee2e2" : "#d1fae5"}`, borderRadius: "7px", background: page.status === "Published" ? "#fef2f2" : "#ecfdf5", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: page.status === "Published" ? "#ef4444" : "#10b981" }}>
                {page.status === "Published" ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => deletePage(page.id)}
                style={{ padding: "7px 10px", border: "1px solid #fee2e2", borderRadius: "7px", background: "#fef2f2", cursor: "pointer", color: "#ef4444" }}>
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editPage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{isAdding ? "Add New Page" : "Edit Page"}</h2>
              <button onClick={() => { setEditPage(null); setIsAdding(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Page Title *</label>
              <input
                value={editPage.title}
                onChange={(e) => setEditPage((prev) => ({
                  ...prev, title: e.target.value,
                  slug: isAdding ? autoSlug(e.target.value) : prev.slug
                }))}
                placeholder="e.g. About Us"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>URL Slug *</label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <span style={{ padding: "9px 12px", background: "#f8fafc", color: "#94a3b8", fontSize: "14px", borderRight: "1px solid #e2e8f0" }}>/</span>
                <input
                  value={editPage.slug}
                  onChange={(e) => setEditPage((prev) => ({ ...prev, slug: autoSlug(e.target.value) }))}
                  placeholder="about-us"
                  style={{ flex: 1, padding: "9px 12px", border: "none", fontSize: "14px", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Content (HTML supported)</label>
              <textarea
                rows={10}
                value={editPage.content}
                onChange={(e) => setEditPage((prev) => ({ ...prev, content: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <input type="checkbox" id="publishStatus" checked={editPage.status === "Published"}
                onChange={(e) => setEditPage((prev) => ({ ...prev, status: e.target.checked ? "Published" : "Draft" }))} />
              <label htmlFor="publishStatus" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Publish this page</label>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setEditPage(null); setIsAdding(false); }}
                style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={() => savePage(editPage)}
                style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSave size={15} /> Save Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewPage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{previewPage.title}</h2>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>/{previewPage.slug}</div>
              </div>
              <button onClick={() => setPreviewPage(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", lineHeight: "1.7", color: "#374151", fontSize: "15px" }}
              dangerouslySetInnerHTML={{ __html: previewPage.content }} />
          </div>
        </div>
      )}
    </div>
  );
}
