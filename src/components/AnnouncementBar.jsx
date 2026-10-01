import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiArrowRight } from "react-icons/fi";
import { API_URL as API_BASE } from "../config";

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("nutriexa_announcement_dismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    async function fetchActiveAnnouncement() {
      try {
        const res = await fetch(`${API_BASE}/api/cms/announcements?activeOnly=true`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnnouncement(data[0]);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch active announcement:", err);
      }
      // Fallback default announcement
      setAnnouncement({
        text: "🎉 Free Shipping on orders above ₹999 | Use code NUTRIEXA10 for 10% off!",
        badge: "LIMITED OFFER",
        link: "/deals",
        ctaText: "Shop Deals",
        icon: "🎉",
        bgColor: "linear-gradient(90deg, #15803d, #22c55e)",
        textColor: "#ffffff",
      });
    }

    fetchActiveAnnouncement();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("nutriexa_announcement_dismissed", "true");
  };

  if (dismissed || !announcement) return null;

  const bgStyle = announcement.bgColor
    ? announcement.bgColor.startsWith("linear-gradient") || announcement.bgColor.startsWith("#")
      ? { background: announcement.bgColor }
      : { backgroundColor: announcement.bgColor }
    : { background: "linear-gradient(90deg, #15803d, #22c55e)" };

  const textColor = announcement.textColor || "#ffffff";

  return (
    <div
      style={{
        ...bgStyle,
        color: textColor,
      }}
      className="relative z-50 text-[11px] sm:text-xs font-medium py-2 px-3 sm:px-6 transition-all duration-300 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Content Center */}
        <div className="flex-1 flex items-center justify-center flex-wrap gap-2 text-center">
          {/* Badge */}
          {announcement.badge && (
            <span className="bg-white/20 text-white font-extrabold text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30 shrink-0">
              {announcement.badge}
            </span>
          )}

          {/* Icon or image */}
          {announcement.image ? (
            <img
              src={announcement.image}
              alt=""
              className="w-4 h-4 object-contain inline-block shrink-0"
            />
          ) : announcement.icon ? (
            <span className="shrink-0 text-sm leading-none">{announcement.icon}</span>
          ) : null}

          {/* Main Text */}
          <span className="font-semibold tracking-wide drop-shadow-xs">
            {announcement.text}
          </span>

          {/* CTA Link */}
          {announcement.link && (
            <Link
              to={announcement.link}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-85 transition-opacity ml-1 whitespace-nowrap text-white"
            >
              <span>{announcement.ctaText || "Shop Now"}</span>
              <FiArrowRight size={12} />
            </Link>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss announcement"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
}
