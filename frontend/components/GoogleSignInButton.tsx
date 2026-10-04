"use client";

import { useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string | null, accessToken?: string) => void;
  onError: (msg: string) => void;
  label?: string;
}

/**
 * Custom-styled Google Sign-In button using the useGoogleLogin hook.
 *
 * Why useGoogleLogin instead of <GoogleLogin>:
 * - <GoogleLogin> calls google.accounts.id.initialize() on every mount/re-render,
 *   causing the "called multiple times" GSI_LOGGER warning when SSE re-renders the tree.
 * - useGoogleLogin hook ONLY fires on click — zero SDK re-init side effects.
 *
 * Token strategy:
 * - flow: "implicit" + openid scope -> Google returns id_token (JWT) + access_token
 * - We send id_token as primary, access_token as fallback
 * - Backend verifies id_token via google-auth-library, or calls /userinfo with access_token
 */
export default function GoogleSignInButton({
  onSuccess,
  onError,
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  const login = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: (tokenResponse) => {
      const idToken = (tokenResponse as any).id_token ?? null;
      const accessToken = tokenResponse.access_token;
      onSuccess(idToken, accessToken);
    },
    onError: (error) => {
      console.error("Google login error:", error);
      onError("Google sign-in failed. Please try again or use a different browser.");
    },
    onNonOAuthError: (error) => {
      if (error.type === "popup_closed") return;
      onError("Google sign-in was blocked. Please allow popups for this site.");
    },
  });

  const handleClick = useCallback(() => {
    login();
  }, [login]);

  return (
    <div className="mm-google-custom-container">
      <button
        type="button"
        className="mm-google-custom-btn"
        onClick={handleClick}
        id="google-signin-btn"
      >
        <span className="mm-google-icon-circle" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        </span>
        <span className="mm-google-btn-text">{label}</span>
      </button>
    </div>
  );
}
