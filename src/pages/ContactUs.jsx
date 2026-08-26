import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiClock, FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "How long does delivery usually take?",
    answer:
      "Orders are typically delivered within 3-5 business days across India. You'll receive a tracking link once your order ships.",
  },
  {
    question: "How do I verify my product is authentic?",
    answer:
      "Every Nutriexa product has a unique code on the label. Use our Authenticator page to instantly verify it.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy on unopened products. Reach out to our support team to start a return.",
  },
  {
    question: "Do you offer bulk or wholesale orders?",
    answer:
      "Yes, for bulk or wholesale inquiries, email us at support@nutriexa.com with your requirements and we'll get back to you.",
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#1a1a1a]">
          {question}
        </span>
        <FiChevronDown
          size={18}
          className={`text-[#4CAF37] shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend contact form endpoint
  };

  return (
    <main>
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-[#4CAF37] to-[#1f5c8f] text-white text-center py-14 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">Get in Touch</h1>
        <p className="text-white/85 mt-3 max-w-md mx-auto">
          We're here to help with orders, products, or anything else on your
          mind.
        </p>
      </section>

      {/* Contact info + form */}
      <section className="max-w-6xl mx-auto px-4 md:px-10 py-14 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a1a1a]">
            Contact Us
          </h2>
          <p className="text-gray-600 mt-3 max-w-md">
            Have a question about your order or our products? Reach out and
            we'll get back to you soon.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <FiMail size={18} className="text-[#4CAF37] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">Email</p>
                <p className="text-sm text-gray-600">support@nutriexa.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiPhone size={18} className="text-[#4CAF37] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">Phone</p>
                <p className="text-sm text-gray-600">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiMapPin size={18} className="text-[#4CAF37] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  Address
                </p>
                <p className="text-sm text-gray-600">
                  Saharanpur, Uttar Pradesh, India
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiClock size={18} className="text-[#4CAF37] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  Business Hours
                </p>
                <p className="text-sm text-gray-600">
                  Mon - Sat: 10:00 AM - 7:00 PM
                </p>
                <p className="text-sm text-gray-600">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          />
          <input
            type="email"
            placeholder="Your Email"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          />
          <button
            type="submit"
            className="bg-[#4CAF37] text-white font-semibold px-7 py-3 rounded-md hover:opacity-90"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Map */}
      <section className="max-w-6xl mx-auto px-4 md:px-10 pb-14">
        <div className="rounded-xl overflow-hidden border border-gray-100 h-72">
          <iframe
            title="Nutriexa Location"
            src="https://www.google.com/maps?q=Saharanpur,Uttar%20Pradesh,India&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f7f8f6] py-14">
        <div className="max-w-3xl mx-auto px-4 md:px-10">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-[#4CAF37] uppercase tracking-wide">
              FAQ
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}