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
    <section className="bg-[#f8faf7] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[#4CAF37] font-semibold text-sm tracking-wide uppercase">
            Customer Love
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mt-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 mt-3">
            Real results from real people who trust Nutriexa every day.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={
                      i < r.rating
                        ? "fill-[#4CAF37] text-[#4CAF37]"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4CAF37]/10 flex items-center justify-center text-[#4CAF37] font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {r.name}
                  </p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}