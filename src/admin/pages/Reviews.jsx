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
  FiRefreshCw,
} from "react-icons/fi";
import { API_URL } from "../../config";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reviews`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reviews.filter((r) => {
    const pName = (r.productName || r.product_name || "").toLowerCase();
    const cName = (r.customerName || r.customer_name || "").toLowerCase();
    const cComment = (r.comment || "").toLowerCase();
    const sTerm = search.toLowerCase();
    const matchSearch = pName.includes(sTerm) || cName.includes(sTerm) || cComment.includes(sTerm);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchRating = ratingFilter === "All" || Number(r.rating) === parseInt(ratingFilter, 10);
    return matchSearch && matchStatus && matchRating;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "Pending").length,
    approved: reviews.filter((r) => r.status === "Approved").length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : "0.0",
  };

  async function updateStatus(id, newStatus) {
    try {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedReview?.id === id) setSelectedReview((prev) => ({ ...prev, status: newStatus }));

      await fetch(`${API_URL}/api/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  }

  async function deleteReview(id) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (selectedReview?.id === id) setSelectedReview(null);

      await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">Product Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Moderate customer reviews, approve or reject submissions.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          title="Refresh Reviews"
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-[#22c55e] text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin text-[#22c55e]" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: "Total Reviews", value: stats.total, color: "text-indigo-500" },
          { label: "Pending Approval", value: stats.pending, color: "text-amber-500" },
          { label: "Approved", value: stats.approved, color: "text-emerald-600" },
          { label: "Avg. Rating", value: stats.avgRating + " ★", color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search reviews, products, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Main content */}
      <div className={`grid gap-5 ${selectedReview ? "grid-cols-1 xl:grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        {/* Reviews Table */}
        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                  {["Product & Customer", "Rating", "Review", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs">{review.productName || review.product_name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{review.customerName || review.customer_name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="font-semibold text-gray-700 dark:text-gray-200 text-xs">{review.title}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${STATUS_STYLES[review.status]}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(review.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedReview(review)} title="View Detail"
                          className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/10 hover:bg-indigo-50 text-gray-600 dark:text-gray-300 hover:text-indigo-600 border border-gray-200 dark:border-white/10 transition-colors cursor-pointer">
                          <FiEye size={14} />
                        </button>
                        {review.status === "Pending" && (
                          <>
                            <button onClick={() => updateStatus(review.id, "Approved")} title="Approve"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors cursor-pointer">
                              <FiCheck size={14} />
                            </button>
                            <button onClick={() => updateStatus(review.id, "Rejected")} title="Reject"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer">
                              <FiX size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteReview(review.id)} title="Delete"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:border-rose-800/30 transition-colors cursor-pointer">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-xs">
                No reviews found matching your filters.
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedReview && (
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-6 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Review Detail</h3>
              <button onClick={() => setSelectedReview(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg cursor-pointer transition-colors">
                <FiX size={18} />
              </button>
            </div>

            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedReview.productName || selectedReview.product_name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedReview.customerName || selectedReview.customer_name} · {selectedReview.customerEmail || selectedReview.customer_email}</div>
            </div>

            <div className="flex items-center gap-2">
              <StarRating rating={selectedReview.rating} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{selectedReview.rating}/5</span>
            </div>

            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">{selectedReview.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{selectedReview.comment}</div>
            </div>

            <div className="flex gap-2 pt-1">
              {selectedReview.status !== "Approved" && (
                <button onClick={() => updateStatus(selectedReview.id, "Approved")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer">
                  <FiThumbsUp size={13} /> Approve
                </button>
              )}
              {selectedReview.status !== "Rejected" && (
                <button onClick={() => updateStatus(selectedReview.id, "Rejected")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer">
                  <FiThumbsDown size={13} /> Reject
                </button>
              )}
            </div>

            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <FiMessageSquare size={13} /> Reply to Customer
              </div>
              <textarea
                rows={3}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-xs outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-y"
              />
              <button className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors">
                Send Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

