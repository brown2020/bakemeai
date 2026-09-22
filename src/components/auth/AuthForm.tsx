"use client";

import { useReducer, FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/firebase";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/Button";
import { setUserAuthToken } from "@/lib/utils/auth";
import { getSafeRedirectPath } from "@/lib/utils/navigation";
import {
  convertErrorToMessage,
  ERROR_MESSAGES,
  getErrorCode,
  isKnownFirebaseAuthError,
} from "@/lib/utils/error-handler";
import { logError, logWarning } from "@/lib/utils/logger";

import { GoogleSignInButton } from "./GoogleSignInButton";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  redirectTo?: string;
}

type AuthFormState = {
  email: string;
  password: string;
  error: string;
  rememberMe: boolean;
  verificationSent: boolean;
  isSubmitting: boolean;
};

type AuthFormAction =
  | { type: "setEmail"; value: string }
  | { type: "setPassword"; value: string }
  | { type: "setRememberMe"; value: boolean }
  | { type: "submitStart" }
  | { type: "submitFailure"; error: string }
  | { type: "submitSuccess"; verificationSent?: boolean }
  | { type: "submitEnd" };

const initialAuthFormState: AuthFormState = {
  email: "",
  password: "",
  error: "",
  rememberMe: false,
  verificationSent: false,
  isSubmitting: false,
};

function authFormReducer(
  state: AuthFormState,
  action: AuthFormAction
): AuthFormState {
  switch (action.type) {
    case "setEmail":
      return { ...state, email: action.value };
    case "setPassword":
      return { ...state, password: action.value };
    case "setRememberMe":
      return { ...state, rememberMe: action.value };
    case "submitStart":
      return { ...state, error: "", isSubmitting: true };
    case "submitFailure":
      return { ...state, error: action.error, isSubmitting: false };
    case "submitSuccess":
      return {
        ...state,
        verificationSent: action.verificationSent ?? state.verificationSent,
        isSubmitting: false,
      };
    case "submitEnd":
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

/** Persistence must complete before email/password sign-in. */
function signInWithEmailPersistence(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<User> {
  return setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  )
    .then(() => signInWithEmailAndPassword(auth, email, password))
    .then(async (userCredential) => {
      await setUserAuthToken(userCredential.user);
      return userCredential.user;
    });
}

/** Create account, persist session cookie, then send verification. */
function signUpWithEmailVerification(
  email: string,
  password: string
): Promise<User> {
  return createUserWithEmailAndPassword(auth, email, password).then(
    async (userCredential) => {
      await setUserAuthToken(userCredential.user);
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    }
  );
}

/**
 * Unified authentication form for login and signup flows.
 */
export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const [state, dispatch] = useReducer(authFormReducer, initialAuthFormState);
  const router = useRouter();

  const safeRedirectTo = getSafeRedirectPath(redirectTo);

  const { signInWithGoogle, error: googleError } =
    useGoogleAuth(safeRedirectTo);

  const isLogin = mode === "login";
  const title = isLogin ? "Sign in to Bake.me" : "Create your Bake.me account";
  const submitLabel = isLogin ? "Sign in" : "Sign up";
  const googleLabel = isLogin ? "Sign in with Google" : "Sign up with Google";
  const altLinkText = isLogin
    ? "Don't have an account? Sign up"
    : "Already have an account? Sign in";
  const altLinkHref = isLogin ? "/signup" : "/login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "submitStart" });

    try {
      if (isLogin) {
        await signInWithEmailPersistence(
          state.email,
          state.password,
          state.rememberMe
        );
        dispatch({ type: "submitSuccess" });
      } else {
        await signUpWithEmailVerification(state.email, state.password);
        dispatch({ type: "submitSuccess", verificationSent: true });
      }
      // Session cookie is set inside sign-in/sign-up helpers before navigate.
      router.push(safeRedirectTo);
    } catch (err) {
      const errorMessage = convertErrorToMessage(
        err,
        isLogin
          ? ERROR_MESSAGES.AUTH.SIGN_IN_FAILED
          : ERROR_MESSAGES.AUTH.GENERIC
      );

      if (isKnownFirebaseAuthError(err)) {
        logWarning(`${isLogin ? "Sign in" : "Sign up"} rejected`, {
          code: getErrorCode(err),
        });
      } else {
        logError(`${isLogin ? "Sign in" : "Sign up"} failed`, err, {
          email: state.email,
        });
      }

      dispatch({ type: "submitFailure", error: errorMessage });
    }
  };

  const displayError = state.error || googleError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-center">{title}</h2>
        </div>

        {displayError && <ErrorMessage message={displayError} />}

        {state.verificationSent && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            Verification email sent! Please check your inbox.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "setEmail", value: e.target.value })
            }
          />

          <PasswordInput
            label="Password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={state.password}
            onChange={(e) =>
              dispatch({ type: "setPassword", value: e.target.value })
            }
          />

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded-sm"
                  checked={state.rememberMe}
                  onChange={(e) =>
                    dispatch({
                      type: "setRememberMe",
                      value: e.target.checked,
                    })
                  }
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  href="/reset-password"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}

          <Button
            type="submit"
            isLoading={state.isSubmitting}
            className="w-full"
          >
            {submitLabel}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleSignInButton onClick={signInWithGoogle} label={googleLabel} />

        <div className="text-center">
          <Link
            href={altLinkHref}
            className="text-blue-700 hover:text-blue-800"
          >
            {altLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
