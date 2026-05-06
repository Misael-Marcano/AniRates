"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  text: string;
}

function SpoilerSpan({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={() => setRevealed(true)}
      style={{
        backgroundColor: revealed ? "transparent" : "#1a1a1a",
        color: revealed ? "inherit" : "#1a1a1a",
        padding: "0 4px",
        borderRadius: "3px",
        cursor: revealed ? "auto" : "pointer",
        userSelect: revealed ? "auto" : "none",
        transition: "background-color 0.2s",
      }}
      title={revealed ? undefined : "Mostrar spoiler"}
    >
      {children}
    </span>
  );
}

function processSpoilers(text: string): string {
  // Replace ||spoiler|| with <spoiler>spoiler</spoiler> custom marker we then map.
  // We use a unique unlikely placeholder that markdown won't touch.
  return text.replace(/\|\|([^|]+?)\|\|/g, "[[SPOILER:$1]]");
}

function resolveAnchor(href: string | undefined): { kind: "usuario"; path: string } | { kind: "external"; href: string } | { kind: "blocked" } {
  if (!href || !href.trim()) return { kind: "blocked" };
  const h = href.trim();
  if (/^\/usuario\/\d+$/.test(h)) return { kind: "usuario", path: h };
  if (/^https?:\/\//i.test(h)) return { kind: "external", href: h };
  return { kind: "blocked" };
}

export default function ReviewMarkdown({ text }: Props) {
  const safe = processSpoilers(text || "");

  return (
    <div className="review-markdown" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-on-surface-variant)", wordBreak: "break-word" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => {
            const r = resolveAnchor(href);
            if (r.kind === "usuario") {
              return (
                <Link href={r.path} style={{ color: "#f5c518", textDecoration: "underline", fontWeight: 600 }}>
                  {children}
                </Link>
              );
            }
            if (r.kind === "external") {
              return (
                <a href={r.href} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#f5c518", textDecoration: "underline" }}>
                  {children}
                </a>
              );
            }
            return <span style={{ color: "var(--color-outline)" }}>{children}</span>;
          },
          img: ({ src, alt }) => {
            const u = typeof src === "string" ? src.trim() : "";
            if (!u || !/^https:\/\/.+/i.test(u)) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={u}
                alt={typeof alt === "string" ? alt : ""}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: "8px", marginTop: "8px", border: "1px solid var(--color-divider)" }}
              />
            );
          },
          code: ({ children }) => (
            <code style={{ background: "var(--color-surface-container-high)", padding: "1px 5px", borderRadius: "3px", fontFamily: "monospace", fontSize: "0.85em" }}>{children}</code>
          ),
          p: ({ children }) => {
            const replaced = replaceSpoilerNodes(children);
            return <p style={{ margin: "0 0 8px" }}>{replaced}</p>;
          },
          li: ({ children }) => {
            const replaced = replaceSpoilerNodes(children);
            return <li style={{ marginLeft: "20px" }}>{replaced}</li>;
          },
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: "3px solid var(--color-divider-strong)", paddingLeft: "10px", margin: "8px 0", color: "var(--color-outline)" }}>{children}</blockquote>
          ),
          h1: ({ children }) => <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "10px 0 6px" }}>{children}</h3>,
          h2: ({ children }) => <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "10px 0 6px" }}>{children}</h4>,
          h3: ({ children }) => <h5 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "8px 0 4px" }}>{children}</h5>,
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  );
}

function replaceSpoilerNodes(children: ReactNode): ReactNode {
  if (typeof children === "string") return splitSpoilers(children);
  if (Array.isArray(children)) return children.map((c, i) => <span key={i}>{replaceSpoilerNodes(c)}</span>);
  return children;
}

function splitSpoilers(text: string): ReactNode {
  const parts = text.split(/\[\[SPOILER:([^\]]+)\]\]/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <SpoilerSpan key={i}>{part}</SpoilerSpan> : <span key={i}>{part}</span>,
  );
}
