import { useEffect, useState } from "react";
import { FiCopy, FiRefreshCw, FiPlus, FiDownload, FiPrinter } from "react-icons/fi";
import QRCode from "qrcode";
import { API_URL as BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

const API_URL = `${BASE_URL}/api/authenticator`;
const PRODUCTS_API = `${BASE_URL}/api/products`;

export default function AuthenticatorCodes() {
  const { hasPermission } = useAuth();
  const canGenerate = hasPermission("authenticator.generate");

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

  // ---- Printable Labels with Direct Verification QR Code ----
  const printLabels = async (codes, productName) => {
    if (!codes.length) return;

    // Generate QR codes linking directly to website verification URL
    const labelsData = await Promise.all(
      codes.map(async (code) => {
        const verifyUrl = `${window.location.origin}/authenticator?code=${encodeURIComponent(code)}`;
        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 160,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
        } catch {
          qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}`;
        }
        return { code, verifyUrl, qrDataUrl };
      })
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print authenticity labels.");
      return;
    }

    const labelsHTML = labelsData
      .map(
        ({ code, qrDataUrl }) => `
        <div class="label">
          <div class="label-header">
            <span class="label-brand">NUTRIEXA</span>
            <span class="label-badge">GENUINE SEAL</span>
          </div>
          <p class="label-product">${productName || "Nutriexa Supplement"}</p>
          <div class="label-content">
            <div class="qr-col">
              <img src="${qrDataUrl}" alt="QR Code" class="label-qr" />
            </div>
            <div class="details-col">
              <span class="code-title">VERIFY AUTHENTICITY</span>
              <p class="label-code">${code}</p>
              <p class="label-hint">Scan QR code to verify instantly on Nutriexa</p>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authenticity QR Labels — ${productName || "Nutriexa"}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              display: flex;
              flex-wrap: wrap;
              gap: 6mm;
              background: #ffffff;
            }
            .label {
              width: 62mm;
              height: 38mm;
              border: 1px dashed #777;
              border-radius: 3mm;
              padding: 2.5mm 3mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: #fff;
            }
            .label-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 0.5px solid #eaeaea;
              padding-bottom: 1mm;
            }
            .label-brand {
              font-size: 9px;
              font-weight: 900;
              color: #22c55e;
              letter-spacing: 0.8px;
            }
            .label-badge {
              font-size: 6px;
              font-weight: 700;
              color: #fff;
              background: #111;
              padding: 0.5mm 1.5mm;
              border-radius: 1mm;
              letter-spacing: 0.5px;
            }
            .label-product {
              font-size: 7.5px;
              font-weight: 600;
              color: #333;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin: 1mm 0 0.5mm 0;
            }
            .label-content {
              display: flex;
              align-items: center;
              gap: 2.5mm;
              margin-top: 0.5mm;
            }
            .qr-col {
              flex-shrink: 0;
              width: 22mm;
              height: 22mm;
              border: 0.5px solid #e0e0e0;
              border-radius: 1.5mm;
              padding: 0.5mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .label-qr {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
            }
            .details-col {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .code-title {
              font-size: 5.5px;
              font-weight: 800;
              color: #666;
              letter-spacing: 0.4px;
            }
            .label-code {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.8px;
              font-family: "Courier New", Courier, monospace;
              color: #111;
              margin: 1mm 0 0.5mm 0;
              word-break: break-all;
            }
            .label-hint {
              font-size: 6px;
              color: #555;
              line-height: 1.2;
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
    setTimeout(() => printWindow.print(), 500);
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

      {/* Generate form (requires authenticator.generate) */}
      {canGenerate ? (
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
                className="bg-[#4CAF37] text-white font-semibold text-sm px-6 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60 cursor-pointer"
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
                    className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline cursor-pointer"
                  >
                    <FiCopy size={13} /> Copy All
                  </button>
                  <button
                    onClick={() => downloadCSV(newCodes, selectedProduct?.name)}
                    className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline cursor-pointer"
                  >
                    <FiDownload size={13} /> Download CSV
                  </button>
                  <button
                    onClick={() => printLabels(newCodes, selectedProduct?.name)}
                    className="flex items-center gap-1.5 text-xs text-[#4CAF37] font-semibold hover:underline cursor-pointer"
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
      ) : (
        /* Read-only product selector */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Select Product to View Authenticity Codes
          </label>
          <select
            value={form.product_id}
            onChange={handleProductChange}
            className="w-full max-w-md border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          >
            <option value="">-- Select a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.variant})
              </option>
            ))}
          </select>
        </div>
      )}

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