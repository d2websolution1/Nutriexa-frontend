import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUploadCloud, FiChevronLeft } from "react-icons/fi";

const API_URL = "http://localhost:5000/api/products";

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    category: "whey-proteins",
    variant: "",
    price: "",
    mrp: "",
    stock: "",
    status: "Active",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();

        setForm({
          name: data.name || "",
          category: data.category || "whey-proteins",
          variant: data.variant || "",
          price: data.price || "",
          mrp: data.mrp || "",
          stock: data.stock || "",
          status: data.status || "Active",
          description: data.description || "",
        });

        if (data.image) {
          setImagePreview(`http://localhost:5000${data.image}`);
        }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

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
      setError("Unable to connect to server. Please try again.");
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
          {isEdit ? "Update product details below." : "Fill in the details to list a new product."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-md px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-5">
        {/* Left — main fields */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                Product Name
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
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                >
                  <option value="whey-proteins">Whey Proteins</option>
                  <option value="mass-gainers">Mass Gainers</option>
                  <option value="pre-workouts">Pre-Workouts</option>
                  <option value="amino-acids">Amino Acids</option>
                  <option value="health-wellness">Health & Wellness</option>
                  <option value="accessories">Accessories</option>
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

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
              Product Image
            </label>

            {imagePreview && (
              <div className="mb-3 w-28 h-28 rounded-md border border-gray-200 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <label className="border-2 border-dashed border-gray-200 rounded-lg py-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#4CAF37] transition-colors block">
              <FiUploadCloud size={28} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                <span className="text-[#4CAF37] font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {/* Right — pricing/status/actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Pricing & Stock</h3>

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