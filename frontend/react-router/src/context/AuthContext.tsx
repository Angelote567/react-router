import React, { createContext, useContext, useMemo, useState } from "react";

export type AuthUser = {
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const LS_TOKEN = "auth:token";
const LS_USER = "auth:user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(LS_TOKEN)
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthContextType>(() => {
    const isAuthenticated = !!token;
    const isAdmin = user?.isAdmin ?? false;

    return {
      user,
      token,
      isAuthenticated,
      isAdmin,

      login(token: string, user: AuthUser) {
        localStorage.setItem(LS_TOKEN, token);
        localStorage.setItem(LS_USER, JSON.stringify(user));
        setToken(token);
        setUser(user);
      },

      logout() {
        localStorage.removeItem(LS_TOKEN);
        localStorage.removeItem(LS_USER);
        setToken(null);
        setUser(null);
      },
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
