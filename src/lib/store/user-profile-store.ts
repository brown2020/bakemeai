import { create } from "zustand";
import type { SerializableUserProfile } from "@/lib/schemas/user";

/**
 * User profile store - manages user profile state.
 * 
 * ARCHITECTURE:
 * - Pure UI state management (no business logic or orchestration)
 * - Only synchronous state setters
 * - Orchestration logic lives in hooks (useUserProfile), not in store
 */
interface UserProfileState {
  userProfile: SerializableUserProfile | null;
  isLoading: boolean;
  error: string | null;
  setUserProfile: (profile: SerializableUserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearUserProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  setUserProfile: (userProfile: SerializableUserProfile | null) => {
    set({ userProfile });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearUserProfile: () => {
    set({ userProfile: null, error: null, isLoading: false });
  },
}));
