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
        <div className="mm-webview-header">
          <div className="mm-webview-icon-wrapper">
            {recommendation.icon}
          </div>
          <h2>Switch to {recommendation.name}</h2>
        </div>
        
        <div className="mm-webview-body">
          <p>
            Secure <strong>Google Login</strong> is restricted in this app&apos;s browser. Switch to a standard browser to continue your shopping journey.
          </p>

          <div className="mm-webview-action-group">
            <button 
              className="mm-webview-launch-btn" 
              onClick={handleLaunch}
            >
              🚀 Launch in {recommendation.name}
            </button>
            
            <button className="mm-webview-copy-btn" onClick={handleCopy}>
              {copied ? "✅ Link Copied!" : "📋 Copy Site Link"}
            </button>
          </div>

          <div className="mm-webview-instruction">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Quick Steps for LinkedIn/iOS:
            </h4>
            <ol>
              <li>Tap the <span className="highlight">three dots (•••)</span> or <span className="highlight">Share</span> icon.</li>
              <li>Select <span className="highlight">&quot;Open in Browser&quot;</span> or <span className="highlight">&quot;Safari&quot;</span>.</li>
              <li>Complete your login securely.</li>
            </ol>
          </div>
        </div>

        <button 
          className="mm-webview-close" 
          onClick={() => setShowWarning(false)}
        >
          Continue in current browser (May fail)
        </button>
      </div>
    </div>
  );
}
