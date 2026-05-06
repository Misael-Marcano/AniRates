"use client";

import type { ContenidoTipo } from "@/types";

type BadgeType = ContenidoTipo | "genre";

interface Variant {
  bg: string;
  text: string;
  label?: string;
}

const variants: Record<string, Variant> = {
  ANIME: { bg: "#1D4ED8", text: "var(--color-on-surface)", label: "ANIME" },
  MANGA: { bg: "#6D28D9", text: "var(--color-on-surface)", label: "MANGA" },
  genre: { bg: "var(--color-surface-container-highest)", text: "var(--color-on-surface-variant)" },
};

interface BadgeProps {
  type?: BadgeType;
  label?: string;
}

export default function Badge({ type = "genre", label }: BadgeProps) {
  const style = variants[type] ?? variants.genre;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label ?? style.label ?? type}
    </span>
  );
}
