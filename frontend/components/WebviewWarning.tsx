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
        <div className="mm-webview-header">
          <div className="mm-webview-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <h2>{isLinkedIn ? "App Recommendation" : "Better Experience"}</h2>
          </div>
        </div>
        
        <p>
          For the best experience, we recommend using <strong>{recommendation.name}</strong>. 
          This ensures all features like Google Login work perfectly.
        </p>

        <div className="mm-webview-instruction">
          <h4>{isIOS ? "How to switch on iOS:" : "How to switch on Android:"}</h4>
          {isIOS || (isLinkedIn && isAndroid) ? (
            <ol>
              <li>Tap the <strong>menu (••• or ⋮)</strong></li>
              <li>Select <strong>&quot;Open in Browser&quot;</strong></li>
            </ol>
          ) : (
            <ol>
              <li>Tap <strong>&quot;Open Chrome&quot;</strong> below</li>
              <li>Or use the menu (⋮) to <strong>&quot;Open in Browser&quot;</strong></li>
            </ol>
          )}
        </div>

        <div className="mm-webview-actions">
          {isAndroid && !isLinkedIn ? (
            <a 
              href={androidIntent}
              target="_blank"
              rel="noopener noreferrer"
              className="mm-webview-copy-btn mm-webview-btn-primary" 
            >
              Open Chrome
            </a>
          ) : (
            <button 
              className="mm-webview-copy-btn mm-webview-btn-primary" 
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          )}

          <button 
            className="mm-webview-copy-btn mm-webview-btn-secondary" 
            onClick={() => setShowWarning(false)}
          >
            Not now
          </button>
        </div>

        <div className="mm-webview-footer-text">
          {isLinkedIn ? "LinkedIn may restrict direct opening. Use the menu above if needed." : "Standalone browsers are faster and more secure."}
        </div>
      </div>
    </div>
  );
}
