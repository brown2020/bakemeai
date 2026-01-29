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

// Suppress Firebase console errors FIRST, before any Firebase code runs
if (typeof window !== "undefined") {
  const originalConsoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    // Convert args to string for checking
    const errorStr = args
      .map((arg) => {
        if (arg instanceof Error) return arg.message + arg.stack;
        return String(arg);
      })
      .join(" ");

    // Filter Firebase auth errors - we handle these gracefully in the UI
    const isFirebaseAuthError =
      (errorStr.includes("Firebase:") && errorStr.includes("auth/")) ||
      errorStr.includes("auth/invalid-credential") ||
      errorStr.includes("auth/user-not-found") ||
      errorStr.includes("auth/wrong-password") ||
      errorStr.includes("auth/email-already-in-use") ||
      errorStr.includes("Error (auth");

    if (!isFirebaseAuthError) {
      originalConsoleError(...args);
    }
  };

  setLogLevel("silent");
}

checkFirebaseConfig();

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
