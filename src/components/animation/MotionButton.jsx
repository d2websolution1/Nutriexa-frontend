import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MotionButton({ children, className = "", to, ...props }) {
  const common = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
    className,
    ...props,
  };

  if (to) {
    return (
      <motion.div {...common}>
        <Link to={to} className={className}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button {...common}>
      {children}
    </motion.button>
  );
}
