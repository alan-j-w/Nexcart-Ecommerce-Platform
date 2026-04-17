"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, type = "error" }: { message: string, type?: "error" | "success" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      background: type === "error" ? "#EF4444" : "#10B981",
      color: "white",
      padding: "16px 24px",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 9999,
      animation: "toast-slide-up 0.3s ease-out forwards",
      fontWeight: 500
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toast-slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}} />
      {type === "error" ? (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m-6.364.382l-1.414-1.414A10.001 10.001 0 0112 2.25a10.001 10.001 0 018.485 5.303l-1.414 1.414a8.001 8.001 0 00-14.142 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.008v.008H12v-.008z" />
        </svg>
      ) : (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{message}</span>
      <button onClick={() => setVisible(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", marginLeft: "8px", padding: "4px" }}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
