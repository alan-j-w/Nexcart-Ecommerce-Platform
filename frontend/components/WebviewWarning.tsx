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
        
        <h2>Better Experience Available</h2>
        
        <p>
          You&apos;re currently using an in-app browser. For the best experience, including 
          <strong> Google Login</strong> and faster performance, we recommend using {recommendation.name}.
        </p>

        <div className="mm-webview-instruction">
          <h4>{isIOS ? "How to switch on iOS:" : "How to switch on Android:"}</h4>
          {isIOS ? (
            <ol>
              <li>Tap the <strong>menu (•••)</strong> or <strong>Share</strong> button.</li>
              <li>Select <strong>&quot;Open in Safari&quot;</strong>.</li>
            </ol>
          ) : (
            <ol>
              <li>Tap <strong>&quot;Open in Chrome&quot;</strong> below.</li>
              <li>Or tap the <strong>menu (⋮)</strong> and select <strong>&quot;Open in Browser&quot;</strong>.</li>
            </ol>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isAndroid ? (
            <a 
              href={androidIntent}
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
              🚀 {copied ? "✅ Link Copied!" : "Copy Link for Safari"}
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

        <button 
          className="mm-webview-close" 
          onClick={handleCopy}
          style={{ marginTop: "12px" }}
        >
          {copied ? "✅ URL Copied!" : "📋 Copy Website URL"}
        </button>
      </div>
    </div>
  );
}
