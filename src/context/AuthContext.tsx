import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, type AuthUser } from "../api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("gymwatch_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.user
        .profile()
        .then((profile) => {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            isAdmin: profile.isAdmin,
            memberSince: profile.memberSince,
            goals: profile.goals,
          });
        })
        .catch((err: unknown) => {
          // Only clear token on 401 — not on server errors (5xx)
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('401') || msg.includes('403')) {
            localStorage.removeItem("gymwatch_token");
            setToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem("gymwatch_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.auth.register(name, email, password);
    localStorage.setItem("gymwatch_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("gymwatch_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin: user?.isAdmin ?? false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
