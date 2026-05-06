"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { AUTH_INVALIDATE_EVENT } from "@/services/auth-sync";

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  tipo?: "admin" | "usuario";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { sub: number; nombre: string; email: string; tipo?: "admin" | "usuario" };
    if (!payload?.sub) return null;
    return { id: payload.sub, nombre: payload.nombre, email: payload.email, tipo: payload.tipo };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Importante: no leer localStorage en el inicializador de useState — el servidor siempre
  // renderiza sin token y el cliente con token rompería la hidratación (React #418).
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setUser(parseToken(stored));
    }

    function onStorage(e: StorageEvent) {
      if (e.key !== "token") return;
      if (!e.newValue) { setToken(null); setUser(null); return; }
      const u = parseToken(e.newValue);
      if (u) { setToken(e.newValue); setUser(u); }
    }
    window.addEventListener("storage", onStorage);

    function onInvalidate() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener(AUTH_INVALIDATE_EVENT, onInvalidate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_INVALIDATE_EVENT, onInvalidate);
    };
  }, []);

  const login = useCallback((newToken: string, refreshToken?: string) => {
    const u = parseToken(newToken);
    if (!u) return;
    localStorage.setItem("token", newToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    setToken(newToken);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
