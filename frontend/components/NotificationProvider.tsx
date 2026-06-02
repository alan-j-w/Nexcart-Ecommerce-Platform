"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/constants";

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  dismissNotification: (id: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Play a beautiful synthesized dual-tone notification chime
  const playChime = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        
        // Warm attack and decay
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = audioCtx.currentTime;
      // Play a warm arpeggio: D5 -> A5
      playTone(587.33, now, 0.35);       // D5
      playTone(880.00, now + 0.1, 0.55); // A5
    } catch (err) {
      console.warn("[Notifications] Web Audio playback blocked or failed:", err);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    // Connect to SSE stream only if user is logged in
    if (isAuthenticated && token) {
      const subscribeUrl = `${API_BASE_URL}/notifications/subscribe?token=${token}`;
      console.log("[Notifications] Subscribing to Server-Sent Events stream...");

      const es = new EventSource(subscribeUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === "SYSTEM_HANDSHAKE") {
            console.log("[Notifications SSE Handshake]:", payload.message);
            return;
          }

          // Trigger a beautiful visual and auditory toast alert
          const newNotif: Notification = {
            id: Math.random().toString(36).substring(2, 9),
            type: payload.type,
            message: payload.message,
            timestamp: new Date(payload.timestamp || Date.now())
          };

          // Play audio beep/chime
          playChime();

          // Add to stack
          setNotifications((prev) => [newNotif, ...prev]);

          // Automatically dismiss after 7 seconds
          setTimeout(() => {
            dismissNotification(newNotif.id);
          }, 7000);

        } catch (err) {
          console.error("[Notifications SSE] Failed to parse message event:", err);
        }
      };

      es.onerror = (err) => {
        console.warn("[Notifications SSE] Connection error or closed. Reconnecting...");
      };

      return () => {
        console.log("[Notifications] Closing subscription event stream...");
        es.close();
        eventSourceRef.current = null;
      };
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
    }
  }, [isAuthenticated, token, isMuted]);

  return (
    <NotificationContext.Provider value={{ notifications, dismissNotification, isMuted, setIsMuted }}>
      {children}

      {/* Render Stack of Toasts */}
      {notifications.length > 0 && (
        <div className="mm-toast-container" aria-live="assertive">
          {notifications.map((notif) => (
            <div key={notif.id} className={`mm-realtime-toast ${notif.type.toLowerCase()}`}>
              {/* Left Decoration Icon */}
              <div className="mm-toast-icon-box">
                {notif.type === "NEW_ORDER" ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                )}
              </div>

              {/* Toast Text Contents */}
              <div className="mm-toast-body">
                <div className="mm-toast-title">
                  {notif.type === "NEW_ORDER" ? "New Order Received!" : "Order Update"}
                </div>
                <div className="mm-toast-msg">{notif.message}</div>
              </div>

              {/* Mute/Unmute quick accessibility control inside the toast */}
              <button 
                className="mm-toast-mute-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>

              {/* Close Button */}
              <button 
                className="mm-toast-close"
                onClick={() => dismissNotification(notif.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
