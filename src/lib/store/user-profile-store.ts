import { create } from "zustand";
import { SerializableUserProfile } from "@/lib/schemas";
import { getUserProfile } from "@/lib/db";
import { handleError, ERROR_MESSAGES } from "@/lib/utils/error-handler";

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
        // updatedAt is intentionally unused since Timestamps can't be passed to server actions
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatedAt, ...serializableProfile } = profile;
        set({ userProfile: serializableProfile });
      } else {
        set({ userProfile: null });
      }
    } catch (error) {
      const message = handleError(
        error,
        "Error loading user profile from store",
        { userId },
        ERROR_MESSAGES.PROFILE.LOAD_FAILED
      );
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  clearUserProfile: () => {
    set({ userProfile: null, error: null, isLoading: false });
  },
}));
