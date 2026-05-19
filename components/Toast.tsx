"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  visible: boolean;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export const toast = {
  success: (message: string) => { if (addToastFn) addToastFn("success", message); },
  error:   (message: string) => { if (addToastFn) addToastFn("error",   message); },
  warning: (message: string) => { if (addToastFn) addToastFn("warning", message); },
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastFn = (type, message) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message, visible: false }]);
      // Two rAF ticks to let the element mount before transitioning in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
          );
        });
      });
      // Start exit animation after 4 s, then remove after transition
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-l-4 border-primary",
    error:   "border-l-4 border-red-500",
    warning: "border-l-4 border-amber-400",
  };

  const iconColors: Record<ToastType, string> = {
    success: "text-primary",
    error:   "text-red-500",
    warning: "text-amber-500",
  };

  const icons: Record<ToastType, string> = {
    success: "✓",
    error:   "✕",
    warning: "⚠",
  };

  if (!toasts.length) return null;

  return (
    <div aria-live="polite" aria-atomic="false" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "flex items-start gap-3 px-4 py-3 rounded-card shadow-dropdown bg-white text-gray-900",
            "pointer-events-auto",
            "transition-all duration-300 ease-in-out",
            t.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full",
            borderColors[t.type],
          ].join(" ")}
        >
          <span className={`text-base font-bold shrink-0 mt-0.5 ${iconColors[t.type]}`}>
            {icons[t.type]}
          </span>
          <p className="text-sm flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="ml-auto text-gray-400 hover:text-gray-600 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
