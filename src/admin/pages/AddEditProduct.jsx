import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUploadCloud, FiChevronLeft, FiX, FiImage } from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";

const API_URL = `${BASE_URL}/api/products`;
const MAX_IMAGES = 5;

export default function AddEditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "whey-proteins",
    variant: "",
    price: "",
    mrp: "",
    stock: "",
    status: "Active",
    description: "",
  });

  // existingImages: URLs already saved on server (edit mode)
  const [existingImages, setExistingImages] = useState([]);
  // newImageFiles: File objects the admin just picked
  const [newImageFiles, setNewImageFiles] = useState([]);
  // newImagePreviews: local object URLs for the new files
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  // Load dynamic categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  /* fetch product on edit */
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();

        setForm({
          name: data.name || "",
          sku: data.sku || "",
          category: data.category || "whey-proteins",
          variant: data.variant || "",
          price: data.price || "",
          mrp: data.mrp || "",
          stock: data.stock || "",
          status: data.status || "Active",
          description: data.description || "",
        });

        // Load images array; fall back to single image field
        let imgs = [];
        if (data.images) {
          try { imgs = JSON.parse(data.images); } catch (_) { imgs = []; }
        }
        if (imgs.length === 0 && data.image) imgs = [data.image];
        setExistingImages(imgs.map((p) => (p.startsWith("http") ? p : `${BASE_URL}${p}`)));
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* pick new files */
  const handleFilesPick = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const allowed = MAX_IMAGES - existingImages.length - newImageFiles.length;
    const slice = picked.slice(0, allowed);

    if (picked.length > allowed) {
      setError(`You can upload at most ${MAX_IMAGES} images per product.`);
    }

    if (!slice.length) return;

    setNewImageFiles((prev) => [...prev, ...slice]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...slice.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = "";
  };

  /* remove existing (server) image */
  const removeExisting = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    setError("");
  };

  /* remove new (pending) image */
  const removeNew = (idx) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setError("");
  };

  const totalImages = existingImages.length + newImageFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      navigate("/admin/login");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    // Tell backend which existing images to keep (paths relative to server)
    const keptPaths = existingImages.map((url) => url.replace(BASE_URL, ""));
    formData.append("existingImages", JSON.stringify(keptPaths));

    // Append new files under field name "images"
    newImageFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      navigate("/admin/products");
    } catch (err) {
      setError("Unable to connect to server. Please make sure the backend is running.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">
        Loading product details...
      </div>
    );
  }

  const generateSku = () => {
    const catCode = (form.category || "PRD").substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({ ...prev, sku: `NX-${catCode}-${rand}` }));
  };

  const defaultCategories = [
    { slug: "whey-proteins", name: "Whey Proteins" },
    { slug: "mass-gainers", name: "Mass Gainers" },
    { slug: "pre-workouts", name: "Pre-Workouts" },
    { slug: "amino-acids", name: "Amino Acids & BCAA" },
    { slug: "health-wellness", name: "Health & Wellness" },
    { slug: "accessories", name: "Accessories" },
  ];

  const categoryOptions = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="space-y-5 max-w-4xl">
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4CAF37]"
      >
        <FiChevronLeft size={16} /> Back to Products
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Update product details below."
            : "Fill in the details to list a new product."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-md px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-5">
        {/* Left: main fields */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Nutriexa Whey Protein"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#1a1a1a] block">
                    Product SKU
                  </label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-[11px] font-semibold text-[#22c55e] hover:underline cursor-pointer"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. NX-WHE-101"
                  className="w-full font-mono border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Variant
                </label>
                <input
                  type="text"
                  name="variant"
                  value={form.variant}
                  onChange={handleChange}
                  placeholder="e.g. 2KG | Chocolate"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] capitalize"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Write product description..."
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] resize-none"
              />
            </div>
          </div>

          {/* Multi-image upload section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] block">
                  Product Images
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload up to {MAX_IMAGES} images. First image is the cover photo.
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  totalImages >= MAX_IMAGES
                    ? "bg-orange-50 text-orange-500"
                    : "bg-green-50 text-[#4CAF37]"
                }`}
              >
                {totalImages} / {MAX_IMAGES}
              </span>
            </div>

            {/* Preview grid */}
            {totalImages > 0 && (
              <div className="grid grid-cols-5 gap-2.5 mb-3">
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 z-10 text-[9px] font-bold bg-[#4CAF37] text-white px-1.5 py-0.5 rounded-full leading-tight">
                        Cover
                      </span>
                    )}
                    <img
                      src={url}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(idx)}
                      className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <FiX size={11} />
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((preview, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-[#4CAF37] bg-green-50"
                  >
                    {existingImages.length === 0 && idx === 0 && (
                      <span className="absolute top-1 left-1 z-10 text-[9px] font-bold bg-[#4CAF37] text-white px-1.5 py-0.5 rounded-full leading-tight">
                        Cover
                      </span>
                    )}
                    <img
                      src={preview}
                      alt={`New ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(idx)}
                      className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <FiX size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload dropzone */}
            {canAddMore ? (
              <label className="border-2 border-dashed border-gray-200 rounded-lg py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#4CAF37] transition-colors block">
                <FiUploadCloud size={26} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="text-[#4CAF37] font-semibold">Click to upload</span>{" "}
                  or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP — up to 5MB each &bull;{" "}
                  {MAX_IMAGES - totalImages} slot{MAX_IMAGES - totalImages !== 1 ? "s" : ""} remaining
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFilesPick}
                />
              </label>
            ) : (
              <div className="border-2 border-dashed border-orange-200 rounded-lg py-6 flex flex-col items-center justify-center text-center bg-orange-50">
                <FiImage size={22} className="text-orange-400 mb-1.5" />
                <p className="text-sm text-orange-500 font-medium">
                  Maximum {MAX_IMAGES} images reached
                </p>
                <p className="text-xs text-orange-400 mt-0.5">
                  Remove an image above to upload a new one
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: pricing / status / actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Pricing &amp; Stock</h3>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Selling Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                MRP (₹)
              </label>
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4CAF37] text-white font-semibold text-sm py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="border border-gray-200 text-[#1a1a1a] font-semibold text-sm py-2.5 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}