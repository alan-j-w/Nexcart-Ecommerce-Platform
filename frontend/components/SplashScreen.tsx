"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 1. Wait 2 seconds for the animation to play
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    // 2. Remove from DOM completely after fade out
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#6e37b2ff",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease-in-out, visibility 0.6s",
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Animated Logo */}
        <div
          className="splash-logo"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            fontWeight: 900,
            color: "#fff",
            marginBottom: "10px",
            letterSpacing: "-2px"
          }}
        >
          Nex<span style={{ color: "#FBBF24" }}>cart</span>
        </div>

        {/* Loading Bar */}
        <div style={{
          width: "140px",
          height: "3px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "10px",
          margin: "0 auto",
          overflow: "hidden",
          position: "relative"
        }}>
          <div className="splash-loader"></div>
        </div>

        <div 
          className="splash-branding"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "0",
            right: "0",
            color: "rgba(255,255,255,0.6)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase"
          }}
        >
          Developed by <span style={{ color: "#FBBF24" }}>Alan Joy Wilson</span>
        </div>
      </div>

      <style>{`
        @keyframes splash-pulse {
          0% { transform: scale(0.98); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-load {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .splash-logo {
          animation: splash-pulse 1.2s ease-out forwards;
          text-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
        }
        .splash-loader {
          position: absolute;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #FBBF24, transparent);
          animation: splash-load 1.5s infinite;
        }
        .splash-branding {
           animation: splash-pulse 2s ease-in;
        }
      `}</style>
    </div>
  );
}
