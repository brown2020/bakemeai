import { useCallback, useEffect } from "react";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { getUserProfile } from "@/lib/db";
import { convertErrorToMessage, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";

/**
 * Custom hook for managing user profile operations.
 * Orchestrates profile fetching and state updates.
 * 
 * @param userId - User ID to fetch profile for
 * @returns User profile state and operations
 */
export function useUserProfile(userId?: string) {
  const {
    userProfile,
    isLoading,
    error,
    setUserProfile,
    setLoading,
    setError,
  } = useUserProfileStore();

  const fetchUserProfile = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);

      try {
        const profile = await getUserProfile(uid);
        if (profile) {
          // Strip Firestore Timestamp - it's not serializable for server actions
          const { updatedAt: _, ...serializableProfile } = profile;
          setUserProfile(serializableProfile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        logError("Error loading user profile", err, { userId: uid });
        const message = convertErrorToMessage(err, ERROR_MESSAGES.PROFILE.LOAD_FAILED);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setUserProfile, setLoading, setError]
  );

  // Auto-fetch when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    refetch: userId ? () => fetchUserProfile(userId) : undefined,
  };
}
