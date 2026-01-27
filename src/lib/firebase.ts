import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Checks for missing Firebase environment variables and logs warnings.
 * Does not throw to avoid race conditions with Next.js 16 + Turbopack env loading.
 * Firebase SDK will fail gracefully with clear errors if config is actually missing.
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
      // Structured logging for production monitoring
      console.error(
        JSON.stringify({
          level: "error",
          message,
          missingVars,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      // Friendly warning for development (don't throw due to Turbopack timing)
      console.warn(
        `⚠️  ${message}\n` +
          "Please check your .env.local file and ensure all Firebase configuration is set."
      );
    }
  }
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
