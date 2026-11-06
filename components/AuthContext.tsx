"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api, { SESSION_EXPIRED_EVENT } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  profileImageUrl?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  isDemo?: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore the session. localStorage only exists in the browser, so this has
  // to run after mount to keep server and client markup identical.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedToken = read("tb_token");
    const storedUser = read("tb_user");
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        write("tb_token", null);
        write("tb_user", null);
      }
    }
    setLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    write("tb_token", null);
    write("tb_user", null);
    router.push("/login");
  }, [router]);

  // The API client raises this when the token is rejected
  useEffect(() => {
    const onExpired = () => {
      if (!read("tb_token")) return;
      logout();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout]);

  // Keep the profile fresh; an invalid or expired token signs the user out
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get("/users/me/self", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const u = res.data.data;
        const next: User = {
          id: u._id || u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          profileImageUrl: u.profileImageUrl,
          isVerified: u.isVerified,
          emailVerified: u.emailVerified,
          isDemo: u.isDemo,
        };
        setUser(next);
        write("tb_user", JSON.stringify(next));
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 401 || status === 403) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    write("tb_token", newToken);
    write("tb_user", JSON.stringify(newUser));
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      write("tb_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, updateUser, logout }),
    [user, token, loading, login, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
