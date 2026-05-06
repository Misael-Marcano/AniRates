"use client";

export default function ReviewImagesGallery({ urls }: { urls?: string[] | null }) {
  const safeUrls = (urls ?? []).filter(Boolean).slice(0, 3);
  if (safeUrls.length === 0) return null;
  return (
    <div
      style={{
        marginTop: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "8px",
      }}
    >
      {safeUrls.map((url, idx) => (
        <a key={`${url}-${idx}`} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas (Cloudinary/hosting) */}
          <img
            src={url}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid var(--color-divider)",
            }}
          />
        </a>
      ))}
    </div>
  );
}
