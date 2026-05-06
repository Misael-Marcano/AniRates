"use client";

import React from "react";

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid rgba(224,92,92,0.3)", padding: "32px", maxWidth: "480px", textAlign: "center" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "40px", color: "#e05c5c", display: "block", marginBottom: "12px" }}>error_outline</span>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-on-surface)", margin: "0 0 8px" }}>
            Algo salió mal
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: "0 0 20px" }}>
            Esta sección no pudo cargarse. Prueba a recargar.
          </p>
          <button onClick={this.reset} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}
