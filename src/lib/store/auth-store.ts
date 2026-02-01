import { create } from "zustand";
import type { SerializableAuthUser } from "@/lib/schemas/auth";

/**
 * Authentication store state interface.
 *
 * Uses SerializableAuthUser instead of Firebase User because:
 * - Firebase User contains non-serializable properties (methods, Timestamps)
 * - Serializable type works better with SSR/hydration
 * - We only need essential fields for UI rendering
 */
interface AuthState {
  user: SerializableAuthUser | null;
  isLoading: boolean;
  setUser: (user: SerializableAuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user: SerializableAuthUser | null) => {
    set({ user });
  },
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
}));
