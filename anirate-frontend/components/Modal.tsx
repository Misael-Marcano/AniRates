"use client";

import { useEffect, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "var(--color-scrim-strong)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-8 rounded-xl"
        style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-lg"
          style={{ color: "var(--color-on-surface-variant)" }}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        {title && (
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--color-on-surface)" }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
