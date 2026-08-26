import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-10 py-20 text-center">
        <FiShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-[#1a1a1a]">
          Your cart is empty
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-md hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-10 py-10">
      <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-6">
        Shopping Cart
      </h1>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-gray-100 rounded-lg p-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{item.name}</p>
                <p className="text-xs text-gray-500">{item.variant}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-md">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:text-[#4CAF37]"
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-3 text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:text-[#4CAF37]"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <span className="text-sm font-bold text-[#1a1a1a] w-20 text-right">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-5 h-fit">
          <h2 className="text-sm font-bold text-[#1a1a1a] mb-4">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Shipping</span>
            <span>{cartTotal >= 1999 ? "Free" : "₹99"}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-[#1a1a1a] border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>
              ₹{(cartTotal + (cartTotal >= 1999 ? 0 : 99)).toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-5 bg-[#4CAF37] text-white font-semibold py-3 rounded-md hover:opacity-90"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}