"use client";

import { memo } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string | null, accessToken?: string) => void;
  onError: (msg: string) => void;
  label?: string;
}

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
    <div style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "44px" }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        use_fedcm_for_prompt={false}
        theme="outline"
        size="large"
        shape="rectangular"
        text={isSignUp ? "signup_with" : "signin_with"}
        width="380"
      />
    </div>
  );
});

export default GoogleSignInButton;
