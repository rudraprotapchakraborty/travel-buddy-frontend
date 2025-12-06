"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("tb_token");
    const storedUser = localStorage.getItem("tb_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.warn("Failed to parse stored user");
      }
    }
    setLoading(false);
  }, []);

  // Refresh /users/me/self when token changes
  useEffect(() => {
    const refreshMe = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/users/me/self`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data.data;
        const userObj: User = {
          id: u._id || u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role
        };
        setUser(userObj);
        localStorage.setItem("tb_user", JSON.stringify(userObj));
      } catch (err) {
        console.error("refresh me failed", err);
      }
    };
    refreshMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("tb_token", newToken);
      localStorage.setItem("tb_user", JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
