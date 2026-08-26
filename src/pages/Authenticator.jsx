import { useEffect, useState } from "react";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch,
  FiPackage,
  FiCamera,
  FiHelpCircle,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/authenticator`;
const PRODUCTS_API = `${API_BASE}/api/products`;

const BADGES = [
  { badge: "100% Genuine", badgeColor: "bg-[#4CAF37]", desc: "Every batch lab-tested for purity and potency" },
  { badge: "Lab Certified", badgeColor: "bg-[#1a1a1a]", desc: "Certified for quality and safety standards" },
  { badge: "Trusted Formula", badgeColor: "bg-[#4CAF37]", desc: "Verified ingredients, no hidden fillers" },
];

export default function Authenticator() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [trustCards, setTrustCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);

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
          image: `${API_BASE}${p.image}`,
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
    setError("");
    setResult(null);

    if (!code.trim()) {
      setError("Please enter your product code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
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

  return (
    <main className="bg-[#f7f8f6]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ea] to-[#f7f8f6] border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-16 md:py-20 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 mb-5">
            <FiShield size={30} className="text-[#4CAF37]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
            Product Authenticator
          </h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto leading-relaxed">
            Verify your Nutriexa product is 100% genuine. Enter the unique
            code printed under the scratch panel on your product label below.
          </p>

          <form
            onSubmit={handleVerify}
            className="mt-8 max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-2 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. XK4P-7QRT-9MNB"
              className="flex-1 text-center sm:text-left text-base tracking-widest font-semibold rounded-lg py-3 px-4 focus:outline-none bg-transparent"
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

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </div>

        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#4CAF37]/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#4CAF37]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </section>

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
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100 mt-4">
                    {result.image && (
                      <img
                        src={`${API_BASE}${result.image}`}
                        alt={result.product_name}
                        className="w-14 h-14 object-contain shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">
                        {result.product_name}
                      </p>
                      {result.variant && (
                        <p className="text-xs text-gray-500">{result.variant}</p>
                      )}
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
      {!cardsLoading && trustCards.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-10 py-16">
          <div className="text-center mb-10">
            <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
              Quality Assurance
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mt-2">
              Every Product. Fully Verified.
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
              Each Nutriexa product goes through strict lab testing and
              authenticity checks before it reaches you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {trustCards.map((card) => (
              <div
                key={card.id}
                className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <span
                  className={`absolute top-3 left-3 z-10 ${card.badgeColor} text-white text-[11px] font-bold px-3 py-1.5 rounded-full`}
                >
                  {card.badge}
                </span>

                <div className="w-full aspect-[4/2.6] overflow-hidden bg-[#f3f6f2] flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-extrabold text-[#1a1a1a] text-base">
                    {card.title}
                  </h3>
                  {card.variant && (
                    <p className="text-xs text-gray-400 mt-0.5">{card.variant}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 md:px-10 py-16">
        <div className="text-center mb-10">
          <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
            How it works
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mt-2">
            3 Simple Steps to Verify
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-xl border border-gray-100 p-6 relative"
            >
              <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-[#4CAF37] text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="w-11 h-11 rounded-lg bg-[#4CAF37]/10 text-[#4CAF37] flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-bold text-[#1a1a1a] text-sm mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

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

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-16">
        <div className="text-center mb-10">
          <span className="text-[#4CAF37] font-semibold text-xs tracking-wide uppercase">
            FAQs
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mt-2">
            Common Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-lg border border-gray-100 p-5"
            >
              <div className="flex items-start gap-3">
                <FiHelpCircle className="text-[#4CAF37] mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold text-sm text-[#1a1a1a] mb-1.5">
                    {faq.q}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}