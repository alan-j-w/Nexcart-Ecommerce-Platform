"use client";

import { memo, useRef, useState, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [btnWidth, setBtnWidth] = useState<string>("324");

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const clientWidth = containerRef.current.clientWidth;
        if (clientWidth > 0) {
          // Google GIS allows width between 200px and 400px
          const clamped = Math.floor(Math.min(400, Math.max(200, clientWidth)));
          setBtnWidth(String(clamped));
        }
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
    <div
      ref={containerRef}
      className="mm-google-login-wrapper"
    >
      <GoogleLogin
        key={btnWidth}
        onSuccess={handleSuccess}
        onError={handleError}
        use_fedcm_for_prompt={false}
        theme="outline"
        size="large"
        shape="rectangular"
        text={isSignUp ? "signup_with" : "signin_with"}
        width={btnWidth}
        locale="en"
      />
    </div>
  );
});

export default GoogleSignInButton;
