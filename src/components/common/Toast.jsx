import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    title: "text-emerald-800",
    msg: "text-emerald-700",
    bar: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-500",
    title: "text-red-800",
    msg: "text-red-700",
    bar: "bg-red-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-800",
    msg: "text-blue-700",
    bar: "bg-blue-500",
  },
};

export default function Toast({ message, type = "success", duration = 3500, onClose }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const Icon = ICONS[type] || ICONS.info;
  const color = COLORS[type] || COLORS.info;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] min-w-[320px] max-w-md border rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${color.bg} ${
        exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
      style={{ animation: exiting ? undefined : "slideInRight 0.35s ease-out" }}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${color.title}`}>
            {type === "success" ? "Thành công" : type === "error" ? "Lỗi" : "Thông báo"}
          </p>
          <p className={`text-sm mt-0.5 ${color.msg}`}>{message}</p>
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose?.(); }, 300); }}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full ${color.bar} rounded-full`}
          style={{ animation: `shrinkWidth ${duration}ms linear forwards` }}
        />
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
