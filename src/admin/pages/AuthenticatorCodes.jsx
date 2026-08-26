import { useEffect, useState } from "react";
import { FiCopy, FiRefreshCw, FiPlus, FiDownload, FiPrinter } from "react-icons/fi";

const API_URL = "http://https://nutriexa-backend.onrender.com/api/authenticator";
const PRODUCTS_API = "http://https://nutriexa-backend.onrender.com/api/products";

export default function AuthenticatorCodes() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    quantity: 10,
    batch_number: "",
    manufactured_date: "",
  });
  const [generating, setGenerating] = useState(false);
  const [newCodes, setNewCodes] = useState([]);
  const [codesList, setCodesList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const selectedProduct = products.find(
    (p) => String(p.id) === String(form.product_id)
  );

  useEffect(() => {
    fetch(PRODUCTS_API)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const fetchCodesForProduct = async (productId) => {
    if (!productId) {
      setCodesList([]);
      return;
    }
    setLoadingList(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/codes/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch codes:", data.message);
        setCodesList([]);
        return;
      }

      setCodesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCodesList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setForm({ ...form, product_id: productId });
    setNewCodes([]);
    fetchCodesForProduct(productId);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!form.product_id) {
      alert("Please select a product.");
      return;
    }

    setGenerating(true);
    setNewCodes([]);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Generate failed:", data);
        alert(data.message || "Failed to generate codes.");
        return;
      }

      setNewCodes(data.codes || []);
      fetchCodesForProduct(form.product_id);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server.");
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(newCodes.join("\n"));
  };

  // ---- CSV Export ----
  const downloadCSV = (codes, productName) => {
    if (!codes.length) return;

    const header = "Code,Product,Batch Number,Verify URL\n";
    const rows = codes
      .map(
        (code) =>
          `"${code}","${productName || ""}","${form.batch_number || ""}","${window.location.origin}/authenticator?code=${code}"`
      )
      .join("\n");

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${(productName || "codes").replace(/\s+/g, "-")}-codes.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---- Printable Labels ----
  const printLabels = (codes, productName) => {
    if (!codes.length) return;

    const printWindow = window.open("", "_blank");

    const labelsHTML = codes
      .map(
        (code) => `
        <div class="label">
          <p class="label-brand">NUTRIEXA</p>
          <p class="label-product">${productName || ""}</p>
          <p class="label-code">${code}</p>
          <p class="label-hint">Scan or enter at nutriexa.com/authenticator</p>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Authenticity Labels — ${productName || ""}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-wrap: wrap;
              gap: 8mm;
            }
            .label {
              width: 55mm;
              height: 30mm;
              border: 1px dashed #999;
              border-radius: 4mm;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              page-break-inside: avoid;
            }
            .label-brand {
              font-size: 9px;
              font-weight: 800;
              color: #4CAF37;
              letter-spacing: 1px;
            }
            .label-product {
              font-size: 8px;
              color: #555;
              margin-top: 1mm;
            }
            .label-code {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-top: 1.5mm;
              font-family: monospace;
            }
            .label-hint {
              font-size: 6px;
              color: #888;
              margin-top: 1.5mm;
            }
          </style>
        </head>
        <body>
          ${labelsHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
          Authenticity Codes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate unique verification codes to print on product packaging.
        </p>
      </div>

      {/* Generate form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-[#1a1a1a] text-sm mb-4 flex items-center gap-2">
          <FiPlus size={16} /> Generate New Codes
        </h2>

        <form onSubmit={handleGenerate} className="grid sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Select Product
            </label>
            <select
              value={form.product_id}
              onChange={handleProductChange}
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              required
            >
              <option value="">-- Select a product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.variant})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Batch Number
            </label>
            <input
              type="text"
              value={form.batch_number}
              onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
              placeholder="e.g. B2026-08"
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={generating}
              className="bg-[#4CAF37] text-white font-semibold text-sm px-6 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate Codes"}
            </button>
          </div>
        </form>

        {newCodes.length > 0 && (
          <div className="mt-5 bg-[#f7f8f6] rounded-md p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <p className="text-xs font-semibold text-[#1a1a1a]">
                {newCodes.length} new codes generated — copy and print these on your product labels
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline"
                >
                  <FiCopy size={13} /> Copy All
                </button>
                <button
                  onClick={() => downloadCSV(newCodes, selectedProduct?.name)}
                  className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline"
                >
                  <FiDownload size={13} /> Download CSV
                </button>
                <button
                  onClick={() => printLabels(newCodes, selectedProduct?.name)}
                  className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline"
                >
                  <FiPrinter size={13} /> Print Labels
                </button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newCodes.map((c) => (
                <span
                  key={c}
                  className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-1.5 text-center"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Existing codes for selected product */}
      {form.product_id && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-2">
            <h2 className="font-bold text-[#1a1a1a] text-sm">
              All Codes for Selected Product
            </h2>
            <div className="flex items-center gap-3">
              {codesList.length > 0 && (
                <>
                  <button
                    onClick={() =>
                      downloadCSV(
                        codesList.map((c) => c.code),
                        selectedProduct?.name
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline"
                  >
                    <FiDownload size={13} /> Export All CSV
                  </button>
                  <button
                    onClick={() =>
                      printLabels(
                        codesList.filter((c) => !c.is_verified).map((c) => c.code),
                        selectedProduct?.name
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline"
                  >
                    <FiPrinter size={13} /> Print Unused
                  </button>
                </>
              )}
              <button
                onClick={() => fetchCodesForProduct(form.product_id)}
                className="text-gray-400 hover:text-[#4CAF37]"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingList && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loadingList &&
                  codesList.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.batch_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.is_verified ? "Used" : "Unused"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(c.created_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                {!loadingList && codesList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                      No codes generated yet for this product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}