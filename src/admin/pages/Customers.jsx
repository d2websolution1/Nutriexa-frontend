import { useEffect, useState } from "react";
import { FiSearch, FiMail, FiMoreVertical } from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";

const API_URL = `${BASE_URL}/api/admin/customers`;

export default function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Failed to load customers. Please check if the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage registered customers.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-md px-3 py-2 max-w-sm">
            <FiSearch className="text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500 text-sm">
                    Loading customers...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafbf9]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4CAF37]/10 text-[#4CAF37] font-bold flex items-center justify-center text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{c.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMail size={11} /> {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.is_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.is_verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-2 rounded-md text-gray-500 hover:text-[#4CAF37] hover:bg-[#4CAF37]/10">
                        <FiMoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500 text-sm">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}