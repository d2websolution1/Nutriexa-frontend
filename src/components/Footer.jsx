import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from "react-icons/fi";
import { TbTruckDelivery, TbLock, TbRefresh } from "react-icons/tb";

export default function Footer() {
  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Deals", path: "/deals" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  const customerService = [
    { label: "Track Your Order", path: "/track-order" },
    { label: "Authenticator", path: "/authenticator" },
    { label: "Returns Policy", path: "/returns" },
    { label: "Support", path: "/contact" },
  ];

  const socials = [
    { icon: FiFacebook, url: "https://facebook.com" },
    { icon: FiInstagram, url: "https://instagram.com" },
    { icon: FiTwitter, url: "https://twitter.com" },
    { icon: FiYoutube, url: "https://youtube.com" },
  ];

  return (
    <footer className="bg-[#121212] text-gray-300">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 justify-center sm:justify-start text-center sm:text-left">
            <TbTruckDelivery size={24} className="text-[#4CAF37] shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-white text-xs sm:text-sm font-semibold">Free Shipping</p>
              <p className="text-[11px] sm:text-xs text-gray-400">On orders above ₹1999</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start text-center sm:text-left">
            <TbLock size={24} className="text-[#4CAF37] shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-white text-xs sm:text-sm font-semibold">Secure Payments</p>
              <p className="text-[11px] sm:text-xs text-gray-400">100% Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start text-center sm:text-left">
            <TbRefresh size={24} className="text-[#4CAF37] shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-white text-xs sm:text-sm font-semibold">Easy Returns</p>
              <p className="text-[11px] sm:text-xs text-gray-400">7 Days Return Policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-sm text-center sm:text-left">
        <div className="sm:col-span-2 md:col-span-1">
          <Link
            to="/"
            className="inline-flex flex-col items-center sm:items-start justify-center shrink-0 group select-none mb-4"
          >
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-[26px] font-black italic tracking-wider text-white leading-none group-hover:opacity-90 transition-opacity">
                NUTRI<span className="text-[#22c55e]">EXA</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 w-full justify-center sm:justify-start">
              <span className="h-[1.5px] w-3 sm:w-3.5 bg-[#22c55e] rounded-full" />
              <span className="text-[7.5px] sm:text-[8px] tracking-[0.22em] text-[#22c55e] font-bold uppercase whitespace-nowrap leading-none">
                Nutrition For Excellence
              </span>
              <span className="h-[1.5px] w-3 sm:w-3.5 bg-[#22c55e] rounded-full" />
            </div>
          </Link>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
            Premium, science-backed supplements crafted to help you fuel your
            potential and hit every fitness goal, faster and safer.
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:bg-[#4CAF37] hover:text-white transition-colors"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 sm:mb-4 uppercase tracking-wide text-xs">
            Quick Links
          </h5>
          <ul className="space-y-2 sm:space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className="text-gray-400 text-xs hover:text-[#4CAF37] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 sm:mb-4 uppercase tracking-wide text-xs">
            Customer Service
          </h5>
          <ul className="space-y-2 sm:space-y-2.5">
            {customerService.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className="text-gray-400 text-xs hover:text-[#4CAF37] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 sm:mb-4 uppercase tracking-wide text-xs">
            Contact
          </h5>
          <ul className="space-y-2.5 sm:space-y-3">
            <li className="flex items-start justify-center sm:justify-start gap-2 text-gray-400 text-xs">
              <FiMail size={15} className="text-[#4CAF37] mt-0.5 shrink-0" />
              support@nutriexa.com
            </li>
            <li className="flex items-start justify-center sm:justify-start gap-2 text-gray-400 text-xs">
              <FiPhone size={15} className="text-[#4CAF37] mt-0.5 shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-start justify-center sm:justify-start gap-2 text-gray-400 text-xs">
              <FiMapPin size={15} className="text-[#4CAF37] mt-0.5 shrink-0" />
              Saharanpur, Uttar Pradesh, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Nutriexa. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-[#4CAF37]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#4CAF37]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}