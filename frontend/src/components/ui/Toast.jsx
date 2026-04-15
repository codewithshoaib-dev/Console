import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Toast({ message, type = "default" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3800);
    return () => clearTimeout(t);
  }, []);

  const styles = {
    default: {
      bg: "bg-background",
      border: "border-[var(--color-border)]",
      text: "text-[var(--color-body)]",
    },
    success: {
      bg: "bg-emerald-900",
      border: "border-emerald-400/30",
      text: "text-white",
    },
    error: {
      bg: "bg-red-900",
      border: "border-red-400/30",
      text: "text-white",
    },
  };

  const s = styles[type] || styles.default;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            max-w-[92vw] sm:max-w-md
            ${s.bg} ${s.border} ${s.text}
            border rounded-xl shadow-xl backdrop-blur-lg
            px-4 py-3
            flex items-start gap-3
          `}
        >
          <div className="text-sm leading-relaxed ">{message}</div>

          <button
            name="dismiss-toast"
            onClick={() => setVisible(false)}
            className="mt-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
