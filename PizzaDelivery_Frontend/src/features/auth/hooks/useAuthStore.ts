import { create } from "zustand";
import { User, UserRole } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  setAuth: (token: string, role: UserRole, user?: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,

  setAuth: (token: string, role: UserRole, user?: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    }
    set({
      token,
      role,
      user: user || null,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
    });
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role") as UserRole | null;
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && role) {
        set({
          token,
          role,
          user,
          isAuthenticated: true,
        });
      }
    }
  },
}));
