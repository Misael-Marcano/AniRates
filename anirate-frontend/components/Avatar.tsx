"use client";

import { useState } from "react";

interface Props {
  name: string;
  size?: number;
  userId?: number;
  imageUrl?: string | null;
}

const PALETTE = [
  { bg: "#f5c518", fg: "#3d2f00" },
  { bg: "#80cbc4", fg: "#06302c" },
  { bg: "#b7c4ff", fg: "#1a2246" },
  { bg: "#d3bbff", fg: "#2a1852" },
  { bg: "#ffb199", fg: "#4a1a0a" },
  { bg: "#ffd54f", fg: "#3d2800" },
  { bg: "#a5d6a7", fg: "#133815" },
  { bg: "#f48fb1", fg: "#4a0a2a" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function Avatar({ name, size = 36, userId, imageUrl }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const showImage = Boolean(imageUrl) && !imgErr;
  const key = userId != null ? String(userId) : name;
  const { bg, fg } = PALETTE[hash(key) % PALETTE.length];
  const initials = name.slice(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.36);

  if (showImage) {
    return (
      <img
        src={imageUrl!}
        alt={name}
        onError={() => setImgErr(true)}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0, display: "block",
        }}
      />
    );
  }

  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: "50%",
      backgroundColor: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: `${fontSize}px`,
      flexShrink: 0,
      lineHeight: 1,
    }}>
      {initials}
    </div>
  );
}
