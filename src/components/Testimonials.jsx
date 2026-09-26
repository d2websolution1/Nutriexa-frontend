import { FiStar } from "react-icons/fi";

export default function Testimonials() {
  const reviews = [
    {
      name: "Rahul Verma",
      role: "Fitness Enthusiast",
      text: "Nutriexa Whey ne mera recovery time kaafi improve kar diya. Taste aur quality dono top notch hain.",
      rating: 5,
    },
    {
      name: "Ayesha Khan",
      role: "Gym Trainer",
      text: "Clients ko recommend karti hoon. Clean ingredients aur results dikhte hain 2-3 weeks mein.",
      rating: 5,
    },
    {
      name: "Karan Mehta",
      role: "Powerlifter",
      text: "Creatine monohydrate ka purity level best hai jo maine try kiya hai. Bloating bhi nahi hoti.",
      rating: 4,
    },
  ];

  return (
    <section className="bg-[#f8faf7] dark:bg-[#0b0e14] py-16 md:py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[#4CAF37] dark:text-[#57c93f] font-semibold text-sm tracking-wide uppercase">
            Customer Love
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-3">
            Real results from real people who trust Nutriexa every day.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white dark:bg-[#111722] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#1f2a3c] hover:shadow-md transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={
                      i < r.rating
                        ? "fill-[#4CAF37] text-[#4CAF37]"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-5">
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4CAF37]/10 dark:bg-[#4CAF37]/20 flex items-center justify-center text-[#4CAF37] dark:text-[#57c93f] font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                    {r.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}