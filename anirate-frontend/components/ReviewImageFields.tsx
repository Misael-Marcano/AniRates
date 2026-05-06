"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { reviewsApi } from "@/services/api";

function filledCount(urls: string[]): number {
  return urls.filter((u) => u.trim().length > 0).length;
}

export default function ReviewImageFields({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const tc = useTranslations("content");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    reviewsApi.getUploadStatus().then((s) => setUploadEnabled(s.enabled)).catch(() => setUploadEnabled(false));
  }, []);

  const slots = [0, 1, 2];
  const nextEmptySlot = () => slots.find((i) => !(value[i] ?? "").trim());

  async function onPickFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    const idx = nextEmptySlot();
    if (idx === undefined) {
      setLocalError(tc("reviewImagesLimit"));
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      const { url } = await reviewsApi.uploadReviewImage(file);
      const cp = [...value];
      cp[idx] = url;
      onChange(cp);
    } catch (e) {
      const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
      if (status === 503) {
        setLocalError(tc("reviewImagesUploadUnavailable"));
      } else {
        setLocalError(e instanceof Error ? e.message : tc("reviewImagesUploadError"));
      }
    } finally {
      setBusy(false);
    }
  }

  const showUploadLink = uploadEnabled && filledCount(value) < 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "var(--color-outline)" }}>
        {tc("reviewImagesHint")}
      </span>
      {slots.map((idx) => (
        <input
          key={idx}
          type="url"
          inputMode="url"
          aria-label={`${tc("reviewImagesUrlPlaceholder")} ${idx + 1}`}
          placeholder={tc("reviewImagesUrlPlaceholder", { n: idx + 1 })}
          value={value[idx] ?? ""}
          onChange={(e) => {
            const cp = [...value];
            cp[idx] = e.target.value;
            onChange(cp);
          }}
          disabled={busy}
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid var(--color-divider)",
            backgroundColor: "var(--color-surface-container-low)",
            color: "var(--color-on-surface)",
            padding: "10px 12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.82rem",
          }}
        />
      ))}
      {showUploadLink && (
        <>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={onPickFile} />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: "none",
              color: busy ? "var(--color-outline-variant)" : "#64b5f6",
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.78rem",
              textDecoration: "underline",
              padding: "2px 0",
            }}
          >
            {busy ? tc("reviewImagesUploading") : tc("reviewImagesUpload")}
          </button>
        </>
      )}
      {localError && (
        <p role="alert" style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#e05c5c" }}>
          {localError}
        </p>
      )}
    </div>
  );
}
