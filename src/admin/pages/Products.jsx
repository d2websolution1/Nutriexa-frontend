import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDownload,
  FiUploadCloud,
  FiX,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
} from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Draft: "bg-gray-100 text-gray-600",
};

const PRODUCTS_API = `${BASE_URL}/api/products`;

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export default function Products() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const canCreate = hasPermission("products.create");
  const canEdit = hasPermission("products.edit");
  const canDelete = hasPermission("products.delete");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // EXPORT TO CSV
  const handleExportCSV = () => {
    if (!products.length) {
      alert("No products available to export.");
      return;
    }

    const headers = ["ID", "SKU", "Name", "Category", "Variant", "Price", "MRP", "Stock", "Status", "Description"];
    const rows = products.map((p) => [
      p.id,
      `"${p.sku || ""}"`,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      `"${(p.variant || "").replace(/"/g, '""')}"`,
      p.price || 0,
      p.mrp || 0,
      p.stock || 0,
      `"${p.status || "Active"}"`,
      `"${(p.description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nutriexa_Products_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DOWNLOAD CSV TEMPLATE
  const downloadSampleTemplate = () => {
    const headers = ["SKU", "Name", "Category", "Variant", "Price", "MRP", "Stock", "Status", "Description"];
    const sampleRows = [
      ['"NX-WHE-1001"', '"Nutriexa Gold Whey Isolate"', '"whey-proteins"', '"2KG | Double Rich Chocolate"', "4499", "5999", "50", '"Active"', '"Ultra-pure whey isolate for rapid muscle recovery"'],
      ['"NX-CRE-1002"', '"Nutriexa Pure Creatine Powder"', '"amino-acids"', '"300g | Micronized"', "1299", "1699", "100", '"Active"', '"100% pure micronized creatine monohydrate for strength"'],
    ];

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Nutriexa_Product_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PARSE IMPORT CSV
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportFeedback(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setImportFeedback({ type: "error", message: "CSV file is empty or missing data rows." });
        return;
      }

      // Simple CSV split helper handling quotes
      const parseCSVLine = (line) => {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(cur.trim().replace(/^["']|["']$/g, ""));
            cur = "";
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ""));
        return result;
      };

      const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (!values.length || (values.length === 1 && !values[0])) continue;

        const rowObj = {};
        rawHeaders.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });

        // Normalize expected keys
        const name = rowObj["name"] || rowObj["product name"] || rowObj["title"];
        const category = rowObj["category"] || "whey-proteins";
        const price = rowObj["price"] || rowObj["selling price"] || "0";
        const sku = rowObj["sku"] || rowObj["code"] || "";
        const variant = rowObj["variant"] || "";
        const mrp = rowObj["mrp"] || "";
        const stock = rowObj["stock"] || rowObj["quantity"] || "0";
        const status = rowObj["status"] || "Active";
        const description = rowObj["description"] || "";

        if (name) {
          rows.push({ name, category, price, sku, variant, mrp, stock, status, description });
        }
      }

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  // SUBMIT IMPORT TO BACKEND
  const handleBulkImportSubmit = async () => {
    if (!parsedRows.length) {
      alert("No valid product rows parsed from CSV.");
      return;
    }

    setImporting(true);
    setImportFeedback(null);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${BASE_URL}/api/products/bulk-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to import products.");

      setImportFeedback({
        type: "success",
        message: data.message,
      });

      fetchProducts();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setParsedRows([]);
        setImportFeedback(null);
      }, 1800);
    } catch (err) {
      setImportFeedback({
        type: "error",
        message: err.message,
      });
    } finally {
      setImporting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page Title & Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your store's catalog, SKUs, inventory status, and CSV import/export.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/categories"
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] hover:border-[#22c55e] text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-2xs transition-colors"
          >
            <FiLayers size={14} /> Categories
          </Link>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] hover:border-[#22c55e] text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Export products to CSV"
          >
            <FiDownload size={14} /> Export CSV
          </button>

          {canCreate && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] hover:border-[#22c55e] text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Import products from CSV"
            >
              <FiUploadCloud size={14} /> Import CSV
            </button>
          )}

          {canCreate && (
            <Link
              to="/admin/products/new"
              className="flex items-center gap-1.5 bg-[#22c55e] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#16a34a] shadow-xs transition-colors"
            >
              <FiPlus size={16} /> Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Table & Search Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-lg px-3 py-2 w-full sm:w-80 border border-gray-200/50">
            <FiSearch className="text-gray-400 shrink-0" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, category..."
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Total {filtered.length} products listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                    Loading product catalog...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-red-500 text-xs">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fafbf9] transition-colors">
                    {/* Product Name & Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          {buildImageUrl(product.image) ? (
                            <img
                              src={buildImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400">
                              NX
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-gray-900 truncate text-[13px]">{product.name}</p>
                          {product.variant && (
                            <p className="text-[11px] text-gray-400 truncate">{product.variant}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {product.sku || `NX-PRD-${product.id}`}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap capitalize">
                      {product.category?.replace(/-/g, " ") || "-"}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-gray-900 font-bold whitespace-nowrap">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                      {product.mrp && Number(product.mrp) > Number(product.price) && (
                        <span className="text-[10px] text-gray-400 line-through ml-1.5 font-normal">
                          ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                      <span
                        className={`${
                          Number(product.stock) <= 5
                            ? "text-red-600 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          STATUS_STYLES[product.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit && (
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Delete Product"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMPORT PRODUCTS MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !importing && setIsImportModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-xl p-6 z-10 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Import Products from CSV</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload a standard `.csv` file with product names, SKU, categories, and prices.
                </p>
              </div>
              <button
                onClick={() => !importing && setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Template Download Banner */}
            <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <FiFileText size={16} className="text-[#22c55e]" />
                <span>Need the proper CSV layout?</span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="font-bold text-[#16a34a] hover:underline cursor-pointer"
              >
                Download Sample Template
              </button>
            </div>

            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-[#22c55e] rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVFileChange}
              />
              <FiUploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-800">
                {importFile ? importFile.name : "Click to select or drop your .csv file here"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Accepts UTF-8 encoded .CSV</p>
            </div>

            {/* Parsed Rows Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    Ready to import {parsedRows.length} products
                  </span>
                  <span className="text-gray-400">Previewing first 3 rows</span>
                </div>
                <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 text-[11px]">
                  {parsedRows.slice(0, 3).map((r, i) => (
                    <div key={i} className="p-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        <p className="text-gray-400">
                          SKU: {r.sku || "Auto"} · Category: {r.category}
                        </p>
                      </div>
                      <span className="font-bold text-gray-800">₹{r.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Alert */}
            {importFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  importFeedback.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {importFeedback.type === "success" ? (
                  <FiCheckCircle size={16} />
                ) : (
                  <FiAlertCircle size={16} />
                )}
                <span>{importFeedback.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={importing}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={!parsedRows.length || importing}
                className="px-5 py-2 text-xs font-bold bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {importing ? "Importing..." : `Import ${parsedRows.length || ""} Products`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}