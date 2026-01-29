import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { setLogLevel } from "firebase/app";
import { logError, logWarning } from "./utils/logger";

/**
 * Checks for missing Firebase environment variables.
 * In production: Throws error to fail fast (missing config = non-functional app).
 * In development: Logs warning to avoid race conditions with Turbopack env loading.
 */
function checkFirebaseConfig(): void {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    const message = `Missing Firebase environment variables: ${missingVars.join(", ")}`;

    if (process.env.NODE_ENV === "production") {
      // Production: Fail fast with clear error
      logError(message, undefined, { missingVars });
      throw new Error(
        `Firebase configuration error: ${message}. ` +
          "Please ensure all required environment variables are set in your deployment configuration."
      );
    } else {
      // Development: Log warning (don't throw due to Turbopack env loading timing)
      logWarning(
        `${message}\nPlease check your .env.local file and ensure all Firebase configuration is set.`,
        { missingVars }
      );
    }
  }
}

checkFirebaseConfig();

// Suppress Firebase console errors
if (typeof window !== "undefined") {
  setLogLevel("silent");

  // Additional console error suppression for Firebase auth errors
  // Firebase v9+ still logs some auth errors to console even with silent log level
  // We catch and handle these errors in our UI, so suppress the console noise
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    // Check if this is a Firebase auth error
    const errorString = args[0]?.toString() || "";
    const isFirebaseAuthError =
      errorString.includes("Firebase:") && errorString.includes("auth/");

    // Only suppress Firebase auth errors, log everything else normally
    if (!isFirebaseAuthError) {
      originalConsoleError.apply(console, args);
    }
  };
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, storage, auth, googleProvider };
