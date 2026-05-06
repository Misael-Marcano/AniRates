"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { personajesApi, type VoiceActorFull } from "@/services/api";

export default function VoiceActorPage() {
  const params = useParams<{ id: string }>();
  const malId = Number(params.id);
  const [data, setData] = useState<VoiceActorFull | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personajesApi.voiceActor(malId)
      .then(setData)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [malId]);

  if (loading) {
    return <main style={{ minHeight: "100vh", paddingTop: "120px", textAlign: "center", color: "var(--color-outline)" }}>Cargando...</main>;
  }
  if (error || !data) {
    return <main style={{ minHeight: "100vh", paddingTop: "120px", textAlign: "center" }}>
      <p style={{ color: "var(--color-on-surface)" }}>{error || "Voice actor no encontrado"}</p>
    </main>;
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        <header style={{ display: "flex", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
          {data.imagen && (
            <div style={{ position: "relative", width: "180px", height: "240px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-surface-container-high)" }}>
              <Image src={data.imagen} alt={data.nombre} fill sizes="180px" style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              {data.nombre}
            </h1>
            {data.idioma && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)" }}>{data.idioma}</p>
            )}
          </div>
        </header>

        {data.personajes.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--color-on-surface)", marginBottom: "16px" }}>
              Personajes que dobla
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {data.personajes.map((p) => (
                <Link key={p.id} href={`/personaje/${p.mal_id}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "10px", overflow: "hidden", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                    {p.imagen && (
                      <div style={{ position: "relative", width: "44px", height: "60px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                        <Image src={p.imagen} alt={p.nombre} fill sizes="44px" style={{ objectFit: "cover" }} />
                      </div>
                    )}
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
