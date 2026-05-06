"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usersApi } from "@/services/api";
import ReviewMarkdown from "./ReviewMarkdown";

function escapeMarkdownLinkLabel(name: string): string {
  return name.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}

function detectMention(text: string, cursor: number): { start: number; query: string } | null {
  const before = text.slice(0, cursor);
  const match = before.match(/(?:^|\s)@([^\s@]{0,80})$/);
  if (!match) return null;
  return { start: cursor - match[0].length, query: match[1] ?? "" };
}

export type MarkdownComposerMode = "review" | "reply";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  mode?: MarkdownComposerMode;
}

export default function MarkdownComposer({ value, onChange, placeholder, rows = 5, mode = "review" }: Props) {
  const listId = useId();
  const isReply = mode === "reply";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionHits, setMentionHits] = useState<{ id: number; nombre: string }[]>([]);
  const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const fetchGen = useRef(0);

  /** Keep stable ref for clearing timeout */
  const mentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function insertSnippet(snippet: string) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + snippet);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function refreshMention(text: string, cursor: number) {
    const m = detectMention(text, cursor);
    if (!m) {
      setMentionOpen(false);
      setMentionHits([]);
      setMentionRange(null);
      return;
    }
    setMentionRange({ start: m.start, end: cursor });

    if (m.query.length < 2) {
      setMentionOpen(false);
      setMentionHits([]);
      setHighlightIdx(0);
      return;
    }

    setMentionOpen(true);
    const gen = ++fetchGen.current;
    if (mentionTimerRef.current) clearTimeout(mentionTimerRef.current);
    mentionTimerRef.current = setTimeout(() => {
      usersApi.searchUsers(m.query).then((rows) => {
        if (fetchGen.current !== gen) return;
        setMentionHits(rows);
        setHighlightIdx(0);
      }).catch(() => {
        if (fetchGen.current !== gen) return;
        setMentionHits([]);
      });
    }, 220);
  }

  function applyMention(user: { id: number; nombre: string }) {
    const el = textareaRef.current;
    if (!el || !mentionRange) return;
    const insert = `[${escapeMarkdownLinkLabel(user.nombre)}](/usuario/${user.id})`;
    const next = `${value.slice(0, mentionRange.start)}${insert}${value.slice(mentionRange.end)}`;
    onChange(next);
    setMentionOpen(false);
    setMentionHits([]);
    setMentionRange(null);
    const pos = mentionRange.start + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  useEffect(() => () => {
    if (mentionTimerRef.current) clearTimeout(mentionTimerRef.current);
  }, []);

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    onChange(next);
    const cursor = e.target.selectionStart ?? next.length;
    refreshMention(next, cursor);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!mentionOpen || mentionHits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, mentionHits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      applyMention(mentionHits[highlightIdx]!);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMentionOpen(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {!isReply && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              {[
                { label: "B", title: "Negrita", snippet: "**texto**" },
                { label: "I", title: "Italica", snippet: "*texto*" },
                { label: "Lista", title: "Lista", snippet: "\n- item 1\n- item 2" },
                { label: "Link", title: "Enlace", snippet: "[texto](https://)" },
                { label: "Spoiler", title: "Spoiler inline", snippet: " ||spoiler|| " },
              ].map((btn) => (
                <button key={btn.title} type="button" title={btn.title} onClick={() => insertSnippet(btn.snippet)}
                  style={{
                    border: "1px solid var(--color-divider)",
                    backgroundColor: "var(--color-surface-container-low)",
                    color: "var(--color-on-surface-variant)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}>
                  {btn.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              style={{
                border: "1px solid var(--color-divider-strong)",
                backgroundColor: preview ? "var(--color-primary-soft)" : "transparent",
                color: preview ? "#f5c518" : "var(--color-outline)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {preview ? "Ocultar preview" : "Ver preview"}
            </button>
          </div>
          <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "var(--color-outline)" }}>
            Escribe <strong style={{ color: "var(--color-on-surface-variant)" }}>@</strong> y al menos dos letras del nombre para mencionar (notificación al usuario).
          </p>
        </>
      )}

      {!isReply && preview && (
        <div style={{ border: "1px solid var(--color-divider)", borderRadius: "8px", padding: "10px 12px", backgroundColor: "var(--color-surface-container-low)", minHeight: "90px" }}>
          {value.trim() ? (
            <ReviewMarkdown text={value} />
          ) : (
            <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)" }}>
              El preview aparecerá aquí cuando escribas.
            </p>
          )}
        </div>
      )}

      {isReply && (
        <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "var(--color-outline)" }}>
          Tip: <strong style={{ color: "var(--color-on-surface-variant)" }}>@nombre</strong> para mencionar (misma sintaxis Markdown que las reviews).
        </p>
      )}

      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          aria-autocomplete={mentionOpen ? "list" : undefined}
          aria-controls={mentionOpen ? listId : undefined}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onSelect={(e) => refreshMention(e.currentTarget.value, e.currentTarget.selectionStart ?? value.length)}
          onClick={(e) => refreshMention(e.currentTarget.value, e.currentTarget.selectionStart ?? value.length)}
          placeholder={placeholder}
          rows={rows}
          style={{
            backgroundColor: "var(--color-surface-container)",
            border: "1px solid var(--color-divider-strong)",
            borderRadius: "8px",
            padding: "14px",
            color: "var(--color-on-surface)",
            fontFamily: "'Inter', sans-serif",
            fontSize: isReply ? "0.8rem" : "0.875rem",
            lineHeight: 1.6,
            resize: "none",
            outline: "none",
            width: "100%",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-divider-strong)";
            window.setTimeout(() => setMentionOpen(false), 180);
          }}
        />

        {mentionOpen && mentionHits.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            style={{
              position: "absolute",
              zIndex: 50,
              left: 0,
              right: 0,
              top: "100%",
              margin: "6px 0 0",
              padding: "6px",
              listStyle: "none",
              backgroundColor: "var(--color-surface-container-high)",
              border: "1px solid var(--color-divider-strong)",
              borderRadius: "8px",
              boxShadow: "0 12px 32px var(--color-scrim-strong)",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {mentionHits.map((u, idx) => (
              <li key={u.id} role="option" aria-selected={idx === highlightIdx}>
                <button
                  type="button"
                  onMouseDown={(ev) => { ev.preventDefault(); applyMention(u); }}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: idx === highlightIdx ? "var(--color-primary-soft)" : "transparent",
                    color: "var(--color-on-surface)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem",
                  }}
                >
                  {u.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
