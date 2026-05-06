"use client";

interface Props {
  distribution: number[]; // 10 buckets: [count_1, count_2, ..., count_10]
  avg?: number;
  total?: number;
}

export default function RatingHistogram({ distribution, avg, total }: Props) {
  const max = Math.max(...distribution, 1);
  const sum = total ?? distribution.reduce((a, b) => a + b, 0);

  return (
    <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--color-on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
          Distribución de puntuaciones
        </h3>
        {avg != null && (
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: "#f5c518", alignSelf: "center" }}>star</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#f5c518" }}>{avg.toFixed(1)}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>/10</span>
          </div>
        )}
      </div>

      {sum === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: 0, textAlign: "center", padding: "16px 0" }}>
          Aún no hay ratings suficientes
        </p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "100px", marginBottom: "8px" }}>
            {distribution.map((count, i) => {
              const pct = max > 0 ? (count / max) * 100 : 0;
              const score = i + 1;
              const percentage = sum > 0 ? ((count / sum) * 100).toFixed(1) : "0";
              return (
                <div key={score} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", position: "relative" }}
                  title={`${score}: ${count} (${percentage}%)`}
                >
                  <div style={{ width: "100%", height: `${pct}%`, minHeight: count > 0 ? "3px" : "0", backgroundColor: score >= 7 ? "#f5c518" : score >= 4 ? "#ff9800" : "#e05c5c", borderRadius: "3px 3px 0 0", transition: "height 0.4s ease, background-color 0.2s", opacity: count > 0 ? 1 : 0.15 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "4px", borderTop: "1px solid var(--color-divider-strong)", paddingTop: "6px" }}>
            {distribution.map((_, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }}>
                {i + 1}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: "10px 0 0", textAlign: "center" }}>
            Basado en <span style={{ color: "var(--color-on-surface-variant)", fontWeight: 600 }}>{sum.toLocaleString("es-ES")}</span> {sum === 1 ? "rating" : "ratings"}
          </p>
        </>
      )}
    </div>
  );
}
