import { useState } from "react";
import {
  FiSave,
  FiUser,
  FiLock,
  FiTruck,
  FiCreditCard,
  FiBell,
} from "react-icons/fi";

const TABS = [
  { id: "general", label: "General", icon: <FiUser size={16} /> },
  { id: "security", label: "Security", icon: <FiLock size={16} /> },
  { id: "shipping", label: "Shipping", icon: <FiTruck size={16} /> },
  { id: "payments", label: "Payments", icon: <FiCreditCard size={16} /> },
  { id: "notifications", label: "Notifications", icon: <FiBell size={16} /> },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your store configuration and preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-5">
        {/* Tabs sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 h-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-medium mb-1 last:mb-0 transition-colors ${
                activeTab === tab.id
                  ? "bg-[#4CAF37] text-white"
                  : "text-gray-600 hover:bg-[#f5f6f4]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-bold text-[#1a1a1a]">Store Information</h2>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Store Name
                </label>
                <input
                  type="text"
                  defaultValue="Nutriexa"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Store Tagline
                </label>
                <input
                  type="text"
                  defaultValue="Nutrition for Excellence"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                    Support Email
                  </label>
                  <input
                    type="email"
                    defaultValue="support@nutriexa.com"
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    defaultValue="+91 98765 43210"
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Store Address
                </label>
                <textarea
                  rows={3}
                  defaultValue="123, Industrial Area, Agra, Uttar Pradesh, India"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] resize-none"
                />
              </div>
              <button className="flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90">
                <FiSave size={16} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-bold text-[#1a1a1a]">Security</h2>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-100 rounded-md px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add an extra layer of security to your admin account.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5.5 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#4CAF37] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4.5 peer-checked:translate-x-[18px]" />
                </label>
              </div>

              <button className="flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90">
                <FiSave size={16} /> Update Security
              </button>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-bold text-[#1a1a1a]">Shipping Settings</h2>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  defaultValue="1999"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Standard Shipping Charge (₹)
                </label>
                <input
                  type="number"
                  defaultValue="79"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                  Estimated Delivery Time (Days)
                </label>
                <input
                  type="text"
                  defaultValue="4-6 business days"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div className="flex items-center justify-between border border-gray-100 rounded-md px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    Enable Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Allow customers to pay on delivery.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#4CAF37] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-[18px]" />
                </label>
              </div>

              <button className="flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90">
                <FiSave size={16} /> Save Shipping Settings
              </button>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-bold text-[#1a1a1a]">Payment Methods</h2>

              {[
                { name: "Razorpay", desc: "Cards, UPI, Netbanking, Wallets", enabled: true },
                { name: "Cash on Delivery", desc: "Pay when order arrives", enabled: true },
                { name: "PayPal", desc: "International payments", enabled: false },
              ].map((method) => (
                <div
                  key={method.name}
                  className="flex items-center justify-between border border-gray-100 rounded-md px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{method.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#4CAF37] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-[18px]" />
                  </label>
                </div>
              ))}

              <button className="flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90">
                <FiSave size={16} /> Save Payment Settings
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-bold text-[#1a1a1a]">Notification Preferences</h2>

              {[
                { label: "New Order Alerts", desc: "Get notified when a new order is placed", enabled: true },
                { label: "Low Stock Alerts", desc: "Get notified when stock falls below threshold", enabled: true },
                { label: "Customer Reviews", desc: "Get notified on new product reviews", enabled: false },
                { label: "Marketing Updates", desc: "Product updates and newsletters from Nutriexa", enabled: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border border-gray-100 rounded-md px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#4CAF37] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-[18px]" />
                  </label>
                </div>
              ))}

              <button className="flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90">
                <FiSave size={16} /> Save Notification Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}