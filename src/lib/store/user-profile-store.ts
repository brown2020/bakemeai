import { create } from "zustand";
import { SerializableUserProfile } from "@/lib/schemas";
import { getUserProfile } from "@/lib/db";
import { logError } from "@/lib/utils/logger";

interface UserProfileState {
  userProfile: SerializableUserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  clearUserProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,
  /**
   * Fetches user profile from Firestore.
   * Strips Firestore Timestamps to ensure profile is serializable for server actions.
   */
  fetchUserProfile: async (userId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        // Strip Firestore Timestamp - it's not serializable for server actions
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatedAt, ...serializableProfile } = profile;
        set({ userProfile: serializableProfile });
      } else {
        set({ userProfile: null });
      }
    } catch (error) {
      logError("Error loading user profile from store", error, { userId });
      set({ error: "Failed to load user profile" });
    } finally {
      set({ isLoading: false });
    }
  },
  clearUserProfile: () => {
    set({ userProfile: null, error: null, isLoading: false });
  },
}));

