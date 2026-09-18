import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AnimateOnView({ children, className = "", variants, threshold = 0.15 }) {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { threshold, once: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const defaultVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants || defaultVariants}
    >
      {children}
    </motion.div>
  );
}
