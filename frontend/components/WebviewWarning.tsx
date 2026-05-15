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
          // Double check if we are still in a webview (in case of re-renders)
          if (isInAppBrowser()) {
            window.location.href = intentUrl;
          }
        }, 800);
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
    }
  };

  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(window.navigator.userAgent);

  return (
    <div className="mm-webview-overlay">
      <div className="mm-webview-card">
        <div className="mm-webview-icon-wrapper">
          {recommendation.icon}
        </div>
        
        <h2>Security Redirect</h2>
        
        <p>
          You&apos;re currently in a restricted in-app browser. 
          <strong> Google Login</strong> and other features are disabled here for your security.
        </p>

        <div className="mm-webview-instruction">
          <h4>{isIOS ? "How to fix on iOS:" : "How to fix on Android:"}</h4>
          {isIOS ? (
            <ol>
              <li>Tap the <strong>menu (•••)</strong> or <strong>Share</strong> button.</li>
              <li>Select <strong>&quot;Open in Safari&quot;</strong>.</li>
              <li>Or copy the link below and paste it in Safari.</li>
            </ol>
          ) : (
            <ol>
              <li>Tap <strong>&quot;Launch Chrome&quot;</strong> below.</li>
              <li>If it fails, tap the <strong>menu (⋮)</strong> and select <strong>&quot;Open in Browser&quot;</strong>.</li>
            </ol>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            className="mm-webview-copy-btn" 
            style={{ background: "var(--mm-purple-600)", color: "white" }} 
            onClick={handleLaunch}
          >
            🚀 {isIOS ? "Copy Link to Safari" : `Launch ${recommendation.name}`}
          </button>

          <button className="mm-webview-copy-btn" onClick={handleCopy} style={{ background: "transparent", border: "1px solid var(--mm-purple-200)", color: "var(--mm-purple-900)" }}>
            {copied ? "✅ Link Copied!" : "📋 Copy URL Manually"}
          </button>
        </div>

        <button 
          className="mm-webview-close" 
          onClick={() => setShowWarning(false)}
        >
          Continue anyway (Features may break)
        </button>
      </div>
    </div>
  );
}
