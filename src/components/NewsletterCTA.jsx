import { FiSend } from "react-icons/fi";

export default function NewsletterCTA() {
  return (
    <section className="relative bg-[#1a1a1a] py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-20">
        <div className="w-80 h-80 rounded-full bg-[#4CAF37] blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 rounded-full bg-[#4CAF37] blur-3xl absolute -bottom-10 -right-10" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Get <span className="text-[#4CAF37]">10% OFF</span> Your First Order
        </h2>
        <p className="text-gray-300 mt-3 max-w-md mx-auto">
          Subscribe for exclusive deals, new arrivals, and fitness tips straight to your inbox.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-md bg-white text-[#1a1a1a] text-sm outline-none focus:ring-2 focus:ring-[#4CAF37]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Subscribe <FiSend size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}