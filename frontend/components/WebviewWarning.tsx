"use client";

import { useState, useEffect } from "react";
import { isInAppBrowser, getBrowserRecommendation } from "@/lib/webviewDetector";

export default function WebviewWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show if in a webview
    if (isInAppBrowser()) {
      setShowWarning(true);
    }
  }, []);

  if (!mounted || !showWarning) return null;

  const recommendation = getBrowserRecommendation();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const ua = typeof window !== "undefined" ? window.navigator.userAgent : "";
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isLinkedIn = /LinkedIn/i.test(ua);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Construct the Android intent URL
  const androidIntent = isAndroid 
    ? `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`
    : "#";

  return (
    <div className="mm-webview-overlay">
      <div className="mm-webview-card">
        <div className="mm-webview-icon-wrapper">
          {recommendation.icon}
        </div>
        
        <h2>{isLinkedIn ? "LinkedIn Link Restricted" : "Better Experience Available"}</h2>
        
        <p>
          {isLinkedIn 
            ? "LinkedIn restricts some features (like Google Login) in their app." 
            : "You're currently using an in-app browser with limited features."}
          For the best experience, we recommend using <strong>{recommendation.name}</strong>.
        </p>

        <div className="mm-webview-instruction">
          <h4>{isIOS ? "How to switch on iOS:" : "How to switch on Android:"}</h4>
          {isIOS || (isLinkedIn && isAndroid) ? (
            <ol>
              <li>Tap the <strong>menu (••• or ⋮)</strong> in the top corner.</li>
              <li>Select <strong>&quot;Open in Browser&quot;</strong> or <strong>&quot;Safari&quot;</strong>.</li>
              <li>Or use the copy button below.</li>
            </ol>
          ) : (
            <ol>
              <li>Tap <strong>&quot;Open in Chrome&quot;</strong> below.</li>
              <li>If it fails, use the menu (⋮) to <strong>&quot;Open in Browser&quot;</strong>.</li>
            </ol>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isAndroid && !isLinkedIn ? (
            <a 
              href={androidIntent}
              target="_blank"
              rel="noopener noreferrer"
              className="mm-webview-copy-btn" 
              style={{ background: "var(--mm-purple-600)", color: "white", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }} 
            >
              🚀 Open in {recommendation.name}
            </a>
          ) : (
            <button 
              className="mm-webview-copy-btn" 
              style={{ background: "var(--mm-purple-600)", color: "white" }} 
              onClick={handleCopy}
            >
              🚀 {copied ? "✅ URL Copied!" : `Copy Link for ${recommendation.name}`}
            </button>
          )}

          <button 
            className="mm-webview-copy-btn" 
            onClick={() => setShowWarning(false)} 
            style={{ background: "var(--mm-bg-secondary)", color: "var(--mm-text-primary)" }}
          >
            Continue here anyway
          </button>
        </div>

        <p style={{ fontSize: "11px", color: "var(--mm-text-muted)", marginTop: "16px" }}>
          {isLinkedIn ? "LinkedIn policy may block direct app opening." : "Standalone browsers provide better security and speed."}
        </p>
      </div>
    </div>
  );
}
