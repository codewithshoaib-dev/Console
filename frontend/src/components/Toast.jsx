import { useUIStore } from "../stores/useUIStore";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const toastColors = {
  success: "bg-green-700 text-white",
  error: "bg-red-700 text-white",
  warning: "bg-yellow-700 text-black",
  default: "bg-card text-heading",
};

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-3">
      {toasts.map((toast) => (
        <AnimatedToast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function AnimatedToast({ toast, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

 return (
   <div
     className={`
        pointer-events-auto rounded-lg shadow-lg p-3
        max-w-[calc(100%-1rem)] w-full flex items-center
        ${toastColors[toast.type || "default"]}
        transform transition-transform duration-300
        ${show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        bg-card
      `}
   >
     <div className="flex-1 min-w-0 pr-2">
       <span className="text-sm whitespace-normal wrap-break-word">
         {toast.message}
       </span>
     </div>
     <button
       name="close-toast"
       onClick={() => {
         setShow(false);
         setTimeout(onClose, 300);
       }}
       className="shrink-0 opacity-70 hover:opacity-100"
     >
       <X size={16} />
     </button>
   </div>
 );

}
