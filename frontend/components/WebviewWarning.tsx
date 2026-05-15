"use client";

import { useState, useEffect } from "react";
import { isInAppBrowser, getBrowserRecommendation } from "@/lib/webviewDetector";

export default function WebviewWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isInAppBrowser()) {
      setShowWarning(true);

      // Attempt auto-launch for Android Chrome
      const ua = window.navigator.userAgent;
      if (/android/i.test(ua)) {
        // This intent scheme forces opening the URL in Chrome on Android
        const intentUrl = `intent://${window.location.href.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        
        // Use a timeout to avoid blocking the initial render
        setTimeout(() => {
          window.location.href = intentUrl;
        }, 500);
      }
    }
  }, []);

  if (!mounted || !showWarning) return null;

  const recommendation = getBrowserRecommendation();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    const ua = window.navigator.userAgent;
    if (/android/i.test(ua)) {
      window.location.href = `intent://${window.location.href.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // For iOS, we can't force Safari, so we copy the link and tell them to paste
      handleCopy();
      alert("Link copied! Please open Safari and paste the link to continue.");
    }
  };

  return (
    <div className="mm-webview-overlay">
      <div className="mm-webview-card">
        <div className="mm-webview-icon-wrapper">
          {recommendation.icon}
        </div>
        
        <h2>Switch to {recommendation.name}</h2>
        
        <p>
          Google Login requires a standalone browser. Tap the button below to switch and get the full experience.
        </p>

        <button 
          className="mm-webview-copy-btn" 
          style={{ marginBottom: "12px", background: "var(--mm-purple-600)", color: "white" }} 
          onClick={handleLaunch}
        >
          🚀 Launch {recommendation.name}
        </button>

        <button className="mm-webview-copy-btn" onClick={handleCopy}>
          {copied ? "✅ Link Copied!" : "📋 Copy Link Manually"}
        </button>

        <button 
          className="mm-webview-close" 
          onClick={() => setShowWarning(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
