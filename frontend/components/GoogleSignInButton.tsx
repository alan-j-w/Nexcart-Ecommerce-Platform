"use client";

import { memo } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string | null, accessToken?: string) => void;
  onError: (msg: string) => void;
  label?: string;
}

// GoogleSignInButton renders the official Google Identity Services button.
// We do NOT change key or width after mount — doing so causes GoogleLogin to
// unmount+remount, which calls google.accounts.id.initialize() again and
// triggers the [GSI_LOGGER] "called multiple times" warning.
const GoogleSignInButton = memo(function GoogleSignInButton({
  onSuccess,
  onError,
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  const isSignUp = label.toLowerCase().includes("sign up");

  const handleSuccess = (res: CredentialResponse) => {
    if (res.credential) {
      onSuccess(res.credential, res.credential);
    } else {
      onError("Google sign-in failed: no credential returned from Google.");
    }
  };

  const handleError = () => {
    onError("Google sign-in was unsuccessful. Please try again.");
  };

  return (
    <div className="mm-google-login-wrapper">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        use_fedcm_for_prompt={false}
        theme="outline"
        size="large"
        shape="rectangular"
        text={isSignUp ? "signup_with" : "signin_with"}
        width="400"
        locale="en"
      />
    </div>
  );
});

export default GoogleSignInButton;
