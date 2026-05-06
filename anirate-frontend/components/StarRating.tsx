"use client";

import { useState } from "react";

interface StarRatingProps {
  value?: number;
  max?: number;
  interactive?: boolean;
  onRate?: (score: number) => void;
}

export default function StarRating({
  value = 0,
  max = 10,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const STARS = 5;
  const filled = Math.round(((hovered || value) / max) * STARS);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: STARS }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < filled ? "#F5C518" : "var(--color-surface-container-highest)",
            fontSize: "1.2rem",
            cursor: interactive ? "pointer" : "default",
            transition: "color 0.1s",
          }}
          onMouseEnter={() => interactive && setHovered(((i + 1) / STARS) * max)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(((i + 1) / STARS) * max)}
        >
          ★
        </span>
      ))}
      {value > 0 && (
        <span className="ml-1 text-sm font-bold" style={{ color: "#F5C518" }}>
          {value} / 10
        </span>
      )}
    </div>
  );
}
