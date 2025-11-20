import { create } from 'zustand';
import { UserProfile } from '@/lib/types';
import { getUserProfile } from '@/lib/db';

interface UserProfileState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  clearUserProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,
  fetchUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        // Remove Firestore timestamp if present to avoid serialization issues
        // and ensure consistent state
        const sanitizedProfile = {
          ...profile,
          updatedAt: undefined,
          updatedAtString: profile.updatedAt?.seconds
            ? new Date(profile.updatedAt.seconds * 1000).toISOString()
            : undefined,
        };
        set({ userProfile: sanitizedProfile });
      } else {
        set({ userProfile: null });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      set({ error: 'Failed to load user profile' });
    } finally {
      set({ isLoading: false });
    }
  },
  clearUserProfile: () => set({ userProfile: null, error: null, isLoading: false }),
}));

