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

  return (
    <div className="mm-webview-overlay">
      <div className="mm-webview-card">
        <div className="mm-webview-icon-wrapper">
          {recommendation.icon}
        </div>
        
        <h2>Open in {recommendation.name}</h2>
        
        <p>
          It looks like you&apos;re using an in-app browser. Google Sign-In is blocked here for security reasons.
        </p>

        <div className="mm-webview-instruction">
          <h4>
            <span>💡</span> How to fix this:
          </h4>
          <ol>
            <li>Tap the three dots (•••) or share icon</li>
            <li>Select <strong>&quot;Open in Browser&quot;</strong> or <strong>&quot;Open in {recommendation.name}&quot;</strong></li>
            <li>Continue your shopping experience!</li>
          </ol>
        </div>

        <button className="mm-webview-copy-btn" onClick={handleCopy}>
          {copied ? "✅ Link Copied!" : "📋 Copy Link to Browser"}
        </button>

        <button 
          className="mm-webview-close" 
          onClick={() => setShowWarning(false)}
        >
          Close and continue anyway (Google Login may not work)
        </button>
      </div>
    </div>
  );
}
