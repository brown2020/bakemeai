import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { getUserProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { ProviderProps } from "../types";

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: ProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const profile = await getUserProfile(auth.currentUser.uid);

        if (!isMounted) return;

        if (profile && profile.updatedAt) {
          setUserProfile({
            ...profile,
            updatedAtString: profile.updatedAt.seconds
              ? new Date(profile.updatedAt.seconds * 1000).toISOString()
              : undefined,
          });
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading user profile:", error);
        setError("Failed to load user profile");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const sanitizedUserProfile = useMemo(
    () =>
      userProfile
        ? {
            ...userProfile,
            updatedAt: undefined, // Remove Firestore timestamp
          }
        : null,
    [userProfile]
  );

  const value = {
    userProfile: sanitizedUserProfile,
    isLoading,
    error,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }

  return context;
}
