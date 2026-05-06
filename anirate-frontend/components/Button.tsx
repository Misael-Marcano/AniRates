"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface StyleDef {
  bg: string;
  color: string;
  border: string;
}

const variants: Record<Variant, StyleDef> = {
  primary:   { bg: "#F5C518", color: "#3d2f00", border: "transparent" },
  secondary: { bg: "transparent", color: "#F5C518", border: "#F5C518" },
  danger:    { bg: "#E53E3E", color: "var(--color-on-surface)", border: "transparent" },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const s = variants[variant];
  return (
    <button
      className={`px-4 py-2 rounded font-semibold text-sm transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "6px",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
