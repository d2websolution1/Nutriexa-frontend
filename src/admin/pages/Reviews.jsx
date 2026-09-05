import { useEffect, useState } from "react";
import {
  FiStar,
  FiSearch,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiFilter,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

const MOCK_REVIEWS = [
  {
    id: 1,
    productName: "Nitro Tech Whey Protein",
    productImage: null,
    customerName: "Rahul Sharma",
    customerEmail: "rahul@example.com",
    rating: 5,
    title: "Best protein powder ever!",
    comment: "Absolutely love this product. Great taste and amazing results after just 4 weeks.",
    status: "Approved",
    helpful: 24,
    date: "2024-05-18T10:30:00Z",
  },
  {
    id: 2,
    productName: "Mass Gainer Pro 6KG",
    productImage: null,
    customerName: "Priya Singh",
    customerEmail: "priya@example.com",
    rating: 4,
    title: "Good product, slightly expensive",
    comment: "Works well for muscle gain. Chocolate flavor is delicious. A bit pricey but worth it.",
    status: "Pending",
    helpful: 8,
    date: "2024-05-17T14:20:00Z",
  },
  {
    id: 3,
    productName: "Pre-Workout Ignite",
    productImage: null,
    customerName: "Arjun Patel",
    customerEmail: "arjun@example.com",
    rating: 3,
    title: "Average product",
    comment: "Decent pump but causes jitters. Not recommended for beginners.",
    status: "Pending",
    helpful: 5,
    date: "2024-05-16T09:45:00Z",
  },
  {
    id: 4,
    productName: "BCAA Ultra Blend",
    productImage: null,
    customerName: "Sneha Rao",
    customerEmail: "sneha@example.com",
    rating: 2,
    title: "Disappointed with taste",
    comment: "Product quality is okay but taste is really bad. Would not buy again.",
    status: "Rejected",
    helpful: 2,
    date: "2024-05-15T16:10:00Z",
  },
  {
    id: 5,
    productName: "Omega-3 Fish Oil",
    productImage: null,
    customerName: "Vikram Kumar",
    customerEmail: "vikram@example.com",
    rating: 5,
    title: "Pure and effective",
    comment: "No fishy aftertaste. Excellent quality capsules. Highly recommended for everyone.",
    status: "Approved",
    helpful: 31,
    date: "2024-05-14T11:20:00Z",
  },
];

const STATUS_STYLES = {
  Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Rejected: "bg-red-100 text-red-700 border border-red-200",
};

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={13}
          fill={s <= rating ? "#f59e0b" : "none"}
          stroke={s <= rating ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function Reviews() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchRating = ratingFilter === "All" || r.rating === parseInt(ratingFilter);
    return matchSearch && matchStatus && matchRating;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "Pending").length,
    approved: reviews.filter((r) => r.status === "Approved").length,
    avgRating: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
  };

  function updateStatus(id, newStatus) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReview?.id === id) setSelectedReview((prev) => ({ ...prev, status: newStatus }));
  }

  function deleteReview(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (selectedReview?.id === id) setSelectedReview(null);
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Product Reviews
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
          Moderate customer reviews, approve or reject submissions.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Reviews", value: stats.total, color: "#6366f1" },
          { label: "Pending Approval", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#10b981" },
          { label: "Avg. Rating", value: stats.avgRating + " ★", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px 20px",
        border: "1px solid #e2e8f0",
        marginBottom: "20px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FiSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search reviews, products, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0",
              borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box"
            }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: selectedReview ? "1fr 380px" : "1fr", gap: "20px" }}>
        {/* Reviews Table */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Product & Customer", "Rating", "Review", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{review.productName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{review.customerName}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StarRating rating={review.rating} />
                  </td>
                  <td style={{ padding: "14px 16px", maxWidth: "220px" }}>
                    <div style={{ fontWeight: 600, color: "#374151", fontSize: "13px" }}>{review.title}</div>
                    <div style={{ color: "#64748b", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {review.comment}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                      ...STATUS_STYLES[review.status] && {}
                    }} className={STATUS_STYLES[review.status]}>
                      {review.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                    {formatDate(review.date)}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => setSelectedReview(review)} title="View Detail"
                        style={{ padding: "5px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#6366f1" }}>
                        <FiEye size={14} />
                      </button>
                      {review.status === "Pending" && (
                        <>
                          <button onClick={() => updateStatus(review.id, "Approved")} title="Approve"
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #d1fae5", background: "#ecfdf5", cursor: "pointer", color: "#10b981" }}>
                            <FiCheck size={14} />
                          </button>
                          <button onClick={() => updateStatus(review.id, "Rejected")} title="Reject"
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fef2f2", cursor: "pointer", color: "#ef4444" }}>
                            <FiX size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteReview(review.id)} title="Delete"
                        style={{ padding: "5px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fef2f2", cursor: "pointer", color: "#ef4444" }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              No reviews found matching your filters.
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedReview && (
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Review Detail</h3>
              <button onClick={() => setSelectedReview(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{selectedReview.productName}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{selectedReview.customerName} · {selectedReview.customerEmail}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <StarRating rating={selectedReview.rating} />
              <span style={{ fontSize: "13px", color: "#64748b" }}>{selectedReview.rating}/5</span>
            </div>

            <div style={{ fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{selectedReview.title}</div>
            <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "16px" }}>{selectedReview.comment}</div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {selectedReview.status !== "Approved" && (
                <button onClick={() => updateStatus(selectedReview.id, "Approved")}
                  style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiThumbsUp size={14} /> Approve
                </button>
              )}
              {selectedReview.status !== "Rejected" && (
                <button onClick={() => updateStatus(selectedReview.id, "Rejected")}
                  style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiThumbsDown size={14} /> Reject
                </button>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, color: "#374151", fontSize: "13px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiMessageSquare size={14} /> Reply to Customer
              </div>
              <textarea
                rows={3}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <button style={{ marginTop: "8px", padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Send Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
