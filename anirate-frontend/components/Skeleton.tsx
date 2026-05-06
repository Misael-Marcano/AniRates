"use client";

interface Props {
  width?: number | string;
  height?: number | string;
  rounded?: number | string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "16px", rounded = "6px", style }: Props) {
  return (
    <>
      <span aria-hidden="true" style={{ display: "inline-block", width, height, borderRadius: rounded, backgroundColor: "var(--color-surface-container-low)", backgroundImage: "linear-gradient(90deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 50%, var(--color-surface-container-low) 100%)", backgroundSize: "200% 100%", animation: "anirate-skel 1.3s ease-in-out infinite", ...style }} />
      <style jsx>{`
        @keyframes anirate-skel {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

/** Grid of poster skeletons used in browse / search / favorites / listas */
export function SkeletonGrid({ count = 12, minColWidth = 160 }: { count?: number; minColWidth?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`, gap: "16px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Skeleton height="auto" style={{ aspectRatio: "2/3" }} rounded="8px" />
          <Skeleton width="85%" height="14px" />
          <Skeleton width="60%" height="11px" />
        </div>
      ))}
    </div>
  );
}

/** Horizontal carousel of poster placeholders (home ContentRow). Mirrors Card 2:3 + title stubs. */
export function SkeletonHomeCardStrip({
  count = 12,
  cardWidth = 180,
  gap = 16,
  hPad = 44,
  showRank = false,
}: {
  count?: number;
  cardWidth?: number;
  gap?: number;
  hPad?: number;
  showRank?: boolean;
}) {
  return (
    <div
      className="hide-scrollbar home-section-scroll"
      aria-hidden
      style={{
        display: "flex",
        gap,
        overflowX: "auto",
        padding: `8px ${hPad}px 4px`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: cardWidth, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "150%",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "var(--color-surface-container-high)",
                boxShadow: "0 4px 16px var(--color-scrim)",
              }}
            >
              <Skeleton
                width="100%"
                height="100%"
                rounded="8px"
                style={{
                  display: "block",
                  position: "absolute",
                  inset: 0,
                }}
              />
              {showRank && (
                <Skeleton
                  width={44}
                  height={28}
                  rounded="6px"
                  style={{
                    display: "block",
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    opacity: 0.85,
                  }}
                />
              )}
            </div>
            <Skeleton width="92%" height="14px" />
            <Skeleton width="58%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal list row skeleton (feed, reviews) */
export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <Skeleton width={40} height={40} rounded="50%" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <Skeleton width="70%" height="14px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="40%" height="10px" />
          </div>
        </div>
      ))}
    </div>
  );
}
