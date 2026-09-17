import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch,
  FiPackage,
  FiCamera,
  FiHelpCircle,
  FiAward,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";
import { API_URL as BASE_URL } from "../config";

const LAB_CERTIFICATES = [
  {
    batchId: "NX-WHEY-2401",
    product: "Nutriexa Whey Protein",
    variant: "3KG | Chocolate",
    testDate: "January 2024",
    lab: "Eurofins Analytical Services India Pvt. Ltd.",
    nabl: "MC-3256",
    fssai: "10019022009765",
    parameters: [
      { name: "Protein Content (per 100g)", claimed: "24.0g", found: "24.2g", status: "PASS" },
      { name: "Total Fat", claimed: "≤5.0g", found: "4.8g", status: "PASS" },
      { name: "Carbohydrates", claimed: "≤5.0g", found: "4.7g", status: "PASS" },
      { name: "Heavy Metals (Lead)", claimed: "Non-detect", found: "ND", status: "PASS" },
      { name: "Heavy Metals (Cadmium)", claimed: "Non-detect", found: "ND", status: "PASS" },
      { name: "Microbial Contamination", claimed: "Absent", found: "Absent", status: "PASS" },
    ],
    purity: "100%",
    overallStatus: "CERTIFIED",
  },
  {
    batchId: "NX-CREATINE-2402",
    product: "Nutriexa Creatine Monohydrate",
    variant: "300g | Unflavoured",
    testDate: "February 2024",
    lab: "Intertek India Pvt. Ltd.",
    nabl: "MC-4177",
    fssai: "10019022009765",
    parameters: [
      { name: "Creatine Monohydrate Purity", claimed: "99.9%", found: "99.97%", status: "PASS" },
      { name: "Moisture Content", claimed: "≤0.5%", found: "0.38%", status: "PASS" },
      { name: "Heavy Metals (Lead)", claimed: "Non-detect", found: "ND", status: "PASS" },
      { name: "Heavy Metals (Mercury)", claimed: "Non-detect", found: "ND", status: "PASS" },
      { name: "Microbial Contamination", claimed: "Absent", found: "Absent", status: "PASS" },
      { name: "Dicyandiamide (Contaminant)", claimed: "Non-detect", found: "ND", status: "PASS" },
    ],
    purity: "99.97%",
    overallStatus: "CERTIFIED",
  },
  {
    batchId: "NX-MASS-2403",
    product: "Nutriexa Mass Gainer",
    variant: "5KG | Chocolate",
    testDate: "March 2024",
    lab: "SGS India Pvt. Ltd.",
    nabl: "MC-5021",
    fssai: "10019022009765",
    parameters: [
      { name: "Protein Content (per 100g)", claimed: "30.0g", found: "30.4g", status: "PASS" },
      { name: "Total Carbohydrates", claimed: "60.0g", found: "59.6g", status: "PASS" },
      { name: "Total Calories", claimed: "400 kcal", found: "398 kcal", status: "PASS" },
      { name: "Heavy Metals (Lead)", claimed: "Non-detect", found: "ND", status: "PASS" },
      { name: "Microbial Contamination", claimed: "Absent", found: "Absent", status: "PASS" },
      { name: "Artificial Colour (Tartrazine)", claimed: "Absent", found: "Absent", status: "PASS" },
    ],
    purity: "100%",
    overallStatus: "CERTIFIED",
  },
];

const API_URL = `${BASE_URL}/api/authenticator`;
const PRODUCTS_API = `${BASE_URL}/api/products`;

const BADGES = [
  { badge: "100% Genuine", badgeColor: "bg-[#4CAF37]", desc: "Every batch lab-tested for purity and potency" },
  { badge: "Lab Certified", badgeColor: "bg-[#1a1a1a]", desc: "Certified for quality and safety standards" },
  { badge: "Trusted Formula", badgeColor: "bg-[#4CAF37]", desc: "Verified ingredients, no hidden fillers" },
];

export default function Authenticator() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("authenticity"); // "authenticity" | "lab-certificate"
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Lab Certificate state
  const [labSearch, setLabSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState(LAB_CERTIFICATES[0]);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);

  const [trustCards, setTrustCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  const verifyCode = useCallback(async (codeToVerify) => {
    const rawCode = (codeToVerify ?? code).trim().toUpperCase();
    if (!rawCode) {
      setError("Please enter your product code.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rawCode }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const trimmed = codeParam.trim().toUpperCase();
      setCode(trimmed);
      verifyCode(trimmed);
    }
  }, [searchParams, verifyCode]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_API);
        const data = await res.json();

        const active = Array.isArray(data)
          ? data.filter((p) => p.status === "Active" && p.image)
          : [];

        const picked = active.slice(0, 3).map((p, i) => ({
          id: p.id,
          title: p.name,
          variant: p.variant,
          image: p.image?.startsWith("http") ? p.image : `${BASE_URL}${p.image}`,
          ...BADGES[i % BADGES.length],
        }));

        setTrustCards(picked);
      } catch (err) {
        console.error("Failed to load trust card products:", err);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyCode();
  };

  const steps = [
    {
      icon: <FiPackage size={22} />,
      title: "Locate the Code",
      desc: "Find the scratch panel or authenticity sticker on your product label, usually near the barcode.",
    },
    {
      icon: <FiCamera size={22} />,
      title: "Scratch & Reveal",
      desc: "Gently scratch the panel to reveal your unique 12-character verification code.",
    },
    {
      icon: <FiSearch size={22} />,
      title: "Enter & Verify",
      desc: "Type the code exactly as shown into the box above and hit Verify to confirm authenticity.",
    },
  ];

  const faqs = [
    {
      q: "Where can I find the authenticity code?",
      a: "It's printed under a scratch-off panel on the product label, typically placed near the barcode or batch number.",
    },
    {
      q: "The code shows 'Already Verified' — what does that mean?",
      a: "Each code can only be verified once. If you're the original buyer and see this message, please contact our support team immediately as this may indicate tampering.",
    },
    {
      q: "What if my code shows invalid?",
      a: "An invalid code means the product could not be verified in our system. This may indicate a counterfeit product. Please stop use and report the seller to us.",
    },
  ];

  // Filter lab certificates by search
  const filteredCerts = LAB_CERTIFICATES.filter(
    (c) =>
      labSearch === "" ||
      c.batchId.toLowerCase().includes(labSearch.toLowerCase()) ||
      c.product.toLowerCase().includes(labSearch.toLowerCase())
  );

  return (
    <main className="bg-[#f7f8f6] dark:bg-gray-900 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ea] to-[#f7f8f6] dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-14 md:py-18 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 mb-5">
            <FiShield size={30} className="text-[#4CAF37]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">
            {activeTab === "authenticity" ? "Product Authenticator" : "Protein Lab Certificate"}
          </h1>
          <p className="text-gray-500 dark:text-gray-300 mt-3 max-w-lg mx-auto leading-relaxed">
            {activeTab === "authenticity"
              ? "Verify your Nutriexa product is 100% genuine. Enter the unique code printed under the scratch panel on your product label below."
              : "View NABL-certified lab test reports for every Nutriexa product batch. Full transparency, zero compromise."}
          </p>

          {/* Tab Selector — 2 circular badges like reference image */}
          <div className="mt-8 inline-flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 px-6 py-4">
            <button
              onClick={() => setActiveTab("authenticity")}
              className={`flex flex-col items-center gap-2 group transition-all ${
                activeTab === "authenticity" ? "opacity-100" : "opacity-50 hover:opacity-75"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                  activeTab === "authenticity"
                    ? "bg-[#f5c518] shadow-lg shadow-[#f5c518]/30 scale-110"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                🔍
              </div>
              <span className={`text-xs font-bold text-center leading-tight ${
                activeTab === "authenticity" ? "text-[#1a1a1a] dark:text-white" : "text-gray-400"
              }`}>
                Check<br />Authenticity
              </span>
            </button>

            <div className="w-px h-12 bg-gray-200 dark:bg-gray-600" />

            <button
              onClick={() => setActiveTab("lab-certificate")}
              className={`flex flex-col items-center gap-2 group transition-all ${
                activeTab === "lab-certificate" ? "opacity-100" : "opacity-50 hover:opacity-75"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                  activeTab === "lab-certificate"
                    ? "bg-[#f5c518] shadow-lg shadow-[#f5c518]/30 scale-110"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                📜
              </div>
              <span className={`text-xs font-bold text-center leading-tight ${
                activeTab === "lab-certificate" ? "text-[#1a1a1a] dark:text-white" : "text-gray-400"
              }`}>
                Protein Lab<br />Certificate
              </span>
            </button>
          </div>

          {/* Authenticity Form */}
          {activeTab === "authenticity" && (
            <form
              onSubmit={handleVerify}
              className="mt-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-2 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK4P-7QRT-9MNB"
                className="flex-1 text-center sm:text-left text-base tracking-widest font-semibold rounded-lg py-3 px-4 focus:outline-none bg-transparent dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
              >
                <FiSearch size={16} />
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}

          {activeTab === "authenticity" && error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </div>

        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#4CAF37]/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#4CAF37]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </section>

      {/* ==================== LAB CERTIFICATE PANEL ==================== */}
      {activeTab === "lab-certificate" && (
        <section className="max-w-4xl mx-auto px-4 md:px-10 py-10">
          {/* Batch Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Select Product Batch</p>
            <div className="relative">
              <div
                onClick={() => setShowBatchDropdown((v) => !v)}
                className="flex items-center justify-between bg-[#f7f8f6] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-sm text-[#1a1a1a] dark:text-white">{selectedCert.product}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedCert.batchId} · {selectedCert.variant}</p>
                </div>
                <FiChevronDown size={18} className={`text-gray-400 transition-transform ${showBatchDropdown ? "rotate-180" : ""}`} />
              </div>
              {showBatchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder="Search batch or product..."
                      value={labSearch}
                      onChange={(e) => setLabSearch(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none dark:text-white"
                    />
                  </div>
                  {filteredCerts.map((cert) => (
                    <button
                      key={cert.batchId}
                      onClick={() => { setSelectedCert(cert); setShowBatchDropdown(false); setLabSearch(""); }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#4CAF37]/10 transition-colors ${
                        selectedCert.batchId === cert.batchId ? "bg-[#4CAF37]/10 border-l-2 border-[#4CAF37]" : ""
                      }`}
                    >
                      <p className="font-bold text-sm text-[#1a1a1a] dark:text-white">{cert.product}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cert.batchId} · {cert.variant}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-[#4CAF37]/40 shadow-md overflow-hidden">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] dark:from-[#0b0e14] dark:to-[#1a2035] px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#4CAF37] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">NABL Accredited</span>
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">FSSAI Compliant</span>
                </div>
                <h2 className="text-white font-extrabold text-lg leading-tight">{selectedCert.product}</h2>
                <p className="text-gray-400 text-sm mt-1">{selectedCert.variant}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#4CAF37] font-black text-xl">✓ CERTIFIED</p>
                <p className="text-gray-400 text-xs mt-1">Lab: {selectedCert.nabl}</p>
              </div>
            </div>

            {/* Meta Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-gray-100 dark:border-gray-700">
              {[
                { label: "Batch ID", value: selectedCert.batchId },
                { label: "Test Date", value: selectedCert.testDate },
                { label: "Testing Lab", value: selectedCert.lab.split(" ").slice(0,2).join(" ") + "..." },
                { label: "Purity Found", value: selectedCert.purity },
              ].map((m) => (
                <div key={m.label} className="p-4 border-r last:border-r-0 border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold mb-1">{m.label}</p>
                  <p className="font-bold text-sm text-[#1a1a1a] dark:text-white">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Test Parameters Table */}
            <div className="p-5">
              <h3 className="font-extrabold text-sm text-[#1a1a1a] dark:text-white mb-4 flex items-center gap-2">
                <FiAward className="text-[#4CAF37]" size={16} /> Test Parameters & Results
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Parameter</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Claimed</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Found</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCert.parameters.map((param, i) => (
                      <tr
                        key={param.name}
                        className={`border-t border-gray-100 dark:border-gray-700 ${
                          i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-700/20"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-[#1a1a1a] dark:text-gray-200">{param.name}</td>
                        <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{param.claimed}</td>
                        <td className="px-4 py-3 text-center font-bold text-[#1a1a1a] dark:text-white">{param.found}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <FiCheckCircle size={10} /> {param.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FSSAI + Download Footer */}
            <div className="px-5 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">🏛️</div>
                <div>
                  <p className="font-bold text-xs text-[#1a1a1a] dark:text-white">FSSAI License: {selectedCert.fssai}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Food Safety & Standards Authority of India</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-[#4CAF37] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                <FiDownload size={14} /> Download Certificate PDF
              </button>
            </div>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            These reports are from NABL-accredited, third-party independent labs. Certificates available for download.
          </p>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="max-w-2xl mx-auto px-4 md:px-10 -mt-2 mb-4">
          <div
            className={`mt-8 rounded-2xl border p-6 md:p-8 shadow-sm ${result.valid && !result.alreadyVerified
                ? "bg-green-50 border-green-200"
                : result.alreadyVerified
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${result.valid && !result.alreadyVerified
                    ? "bg-green-100"
                    : result.alreadyVerified
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
              >
                {result.valid && !result.alreadyVerified ? (
                  <FiCheckCircle className="text-green-600" size={26} />
                ) : result.alreadyVerified ? (
                  <FiAlertTriangle className="text-yellow-600" size={26} />
                ) : (
                  <FiXCircle className="text-red-600" size={26} />
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={`text-lg font-extrabold ${result.valid && !result.alreadyVerified
                      ? "text-green-700"
                      : result.alreadyVerified
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                >
                  {result.valid && !result.alreadyVerified
                    ? "Genuine Product Verified"
                    : result.alreadyVerified
                      ? "Code Already Verified"
                      : "Verification Failed"}
                </h3>
                <p className="text-sm text-gray-700 mt-1">{result.message}</p>

                {result.valid && result.product_name && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mt-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {result.image && (
                        <div className="w-24 h-28 sm:w-28 sm:h-32 bg-[#fafbf9] rounded-xl p-2 border border-gray-100 flex items-center justify-center shrink-0 shadow-inner">
                          <img
                            src={result.image.startsWith("http") ? result.image : `${BASE_URL}${result.image}`}
                            alt={result.product_name}
                            className="max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
                            loading="eager"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100/80 text-green-800 text-[11px] font-bold tracking-wide uppercase mb-1">
                          <FiCheckCircle size={12} className="text-[#4CAF37]" /> 100% Genuine Formula
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-[#1a1a1a] leading-snug">
                          {result.product_name}
                        </h4>
                        {result.variant && (
                          <p className="text-xs font-semibold text-gray-600 mt-1">
                            Specification: <span className="text-[#1a1a1a] font-bold">{result.variant}</span>
                          </p>
                        )}
                        {result.batch_number && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Batch: <span className="font-mono font-semibold text-gray-700">{result.batch_number}</span>
                          </p>
                        )}
                        {result.code && (
                          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            Security Code: {result.code}
                          </p>
                        )}
                        {(result.product_id || result.slug) && (
                          <div className="mt-3">
                            <Link
                              to={`/product/${result.slug || result.product_id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#4CAF37] hover:text-[#3e8e2e] hover:underline"
                            >
                              View Complete Product Info &rarr;
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {result.verified_at && (
                  <p className="text-xs text-gray-400 mt-3">
                    Verified on{" "}
                    {new Date(result.verified_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust cards — real product images */}
      {activeTab === "authenticity" && !cardsLoading && trustCards.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-10 py-16">
          <div className="text-center mb-10">
            <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
              Quality Assurance
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
              Every Product. Fully Verified.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm">
              Each Nutriexa product goes through strict lab testing and
              authenticity checks before it reaches you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {trustCards.map((card) => (
              <div
                key={card.id}
                className="group relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <span
                  className={`absolute top-3 left-3 z-10 ${card.badgeColor} text-white text-[11px] font-bold px-3 py-1.5 rounded-full`}
                >
                  {card.badge}
                </span>

                <div className="w-full aspect-[4/2.6] overflow-hidden bg-[#f3f6f2] dark:bg-gray-700 flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-extrabold text-[#1a1a1a] dark:text-white text-base">
                    {card.title}
                  </h3>
                  {card.variant && (
                    <p className="text-xs text-gray-400 mt-0.5">{card.variant}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works — only show on authenticity tab */}
      {activeTab === "authenticity" && (
      <section className="max-w-5xl mx-auto px-4 md:px-10 py-16">
        <div className="text-center mb-10">
          <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
            How it works
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
            3 Simple Steps to Verify
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 relative"
            >
              <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-[#4CAF37] text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="w-11 h-11 rounded-lg bg-[#4CAF37]/10 text-[#4CAF37] flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Why authenticity matters */}
      <section className="bg-[#1a1a1a] py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-10 grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-white font-extrabold text-2xl">100%</h3>
            <p className="text-gray-400 text-sm mt-1">Genuine Guarantee</p>
          </div>
          <div>
            <h3 className="text-white font-extrabold text-2xl">Lab Tested</h3>
            <p className="text-gray-400 text-sm mt-1">Every Batch Verified</p>
          </div>
          <div>
            <h3 className="text-white font-extrabold text-2xl">50,000+</h3>
            <p className="text-gray-400 text-sm mt-1">Trusted Customers</p>
          </div>
        </div>
      </section>

      {/* FAQ — only show on authenticity tab */}
      {activeTab === "authenticity" && (
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-16">
        <div className="text-center mb-10">
          <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
            FAQs
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
            Common Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-5"
            >
              <div className="flex items-start gap-3">
                <FiHelpCircle className="text-[#4CAF37] mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold text-sm text-[#1a1a1a] dark:text-white mb-1.5">
                    {faq.q}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}