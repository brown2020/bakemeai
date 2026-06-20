"use client";

import { useCallback, useEffect, useRef } from "react";
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
    clearUserProfile,
  } = useUserProfileStore();
  const requestVersionRef = useRef(0);

  const fetchUserProfile = useCallback(
    async (
      uid: string,
      currentVersion: number,
      clearBeforeFetch: boolean = false
    ) => {
      setLoading(true);
      setError(null);
      if (clearBeforeFetch) {
        setUserProfile(null);
      }

      try {
        const profile = await getUserProfile(uid);
        if (currentVersion !== requestVersionRef.current) return;

        if (profile) {
          // Strip Firestore Timestamp - it's not serializable for server actions
          const { updatedAt: _, ...serializableProfile } = profile;
          setUserProfile(serializableProfile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        if (currentVersion !== requestVersionRef.current) return;

        logError("Error loading user profile", err, { userId: uid });
        const message = convertErrorToMessage(err, ERROR_MESSAGES.PROFILE.LOAD_FAILED);
        setError(message);
      } finally {
        if (currentVersion === requestVersionRef.current) {
          setLoading(false);
        }
      }
    },
    [setUserProfile, setLoading, setError]
  );

  // Auto-fetch when userId changes
  useEffect(() => {
    const currentVersion = ++requestVersionRef.current;

    if (!userId) {
      clearUserProfile();
      return;
    }

    void fetchUserProfile(userId, currentVersion, true);
  }, [userId, fetchUserProfile, clearUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    refetch: userId
      ? () => {
          const currentVersion = ++requestVersionRef.current;
          return fetchUserProfile(userId, currentVersion);
        }
      : undefined,
  };
}
