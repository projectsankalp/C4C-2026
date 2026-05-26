import { API_BASE } from "@/lib/api-base";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const API = API_BASE;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "address">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStored(): AuthState {
  try {
    const token = localStorage.getItem("hastkala_token");
    const user = localStorage.getItem("hastkala_user");
    return {
      token,
      user: user ? JSON.parse(user) : null,
      loading: false,
    };
  } catch {
    return { token: null, user: null, loading: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStored);

  useEffect(() => {
    const token = state.token;
    if (!token) return;

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Session expired");
        return r.json();
      })
      .then((res) => {
        if (res.success) {
          const user = res.data.user;
          setState((s) => ({ ...s, user }));
          localStorage.setItem("hastkala_user", JSON.stringify(user));
        }
      })
      .catch(() => {
        localStorage.removeItem("hastkala_token");
        localStorage.removeItem("hastkala_user");
        setState({ token: null, user: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Login failed");
    }
    const { user, token } = json.data;
    localStorage.setItem("hastkala_token", token);
    localStorage.setItem("hastkala_user", JSON.stringify(user));
    setState({ user, token, loading: false });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Registration failed");
    }
    const { user, token } = json.data;
    localStorage.setItem("hastkala_token", token);
    localStorage.setItem("hastkala_user", JSON.stringify(user));
    setState({ user, token, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hastkala_token");
    localStorage.removeItem("hastkala_user");
    setState({ user: null, token: null, loading: false });
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<User, "name" | "phone" | "address">>) => {
    if (!state.token) throw new Error("Not authenticated");
    const res = await fetch(`${API}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Update failed");
    }
    const user = json.data.user;
    localStorage.setItem("hastkala_user", JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
