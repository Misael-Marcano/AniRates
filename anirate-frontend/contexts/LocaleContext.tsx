"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";

export type Locale = "es" | "en" | "pt-BR";

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  es: esMessages,
  en: enMessages,
  "pt-BR": ptBRMessages,
};

const STORAGE_KEY = "anirate_locale";

function detect(): Locale {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in MESSAGES) return stored;
  const browser = navigator.language;
  if (browser.startsWith("pt")) return "pt-BR";
  if (browser.startsWith("en")) return "en";
  return "es";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    setLocaleState(detect());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="America/Caracas">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
