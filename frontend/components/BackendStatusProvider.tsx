"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants";
import {
  BackendStatus,
  setBackendStatus,
  subscribeBackendStatus,
  subscribeActiveRequests,
} from "@/lib/backendStatus";

interface BackendStatusContextType {
  status: BackendStatus;
  activeRequests: number;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState<BackendStatus>("checking");
  const [activeRequests, setActiveRequests] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);

  // 1. Subscribe to global state
  useEffect(() => {
    const unsubStatus = subscribeBackendStatus((newStatus) => {
      setStatusState(newStatus);
    });

    const unsubRequests = subscribeActiveRequests((count) => {
      setActiveRequests(count);
      // Reset overlay dismissed status when requests go to 0,
      // so if they try a new request later it will show the modal again.
      if (count === 0) {
        setIsOverlayDismissed(false);
      }
    });

    return () => {
      unsubStatus();
      unsubRequests();
    };
  }, []);

  // 2. Perform initial health check and handle polling if sleeping
  useEffect(() => {
    let isMounted = true;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;

    const performHealthCheck = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (response.ok && isMounted) {
          setBackendStatus("online");
        } else {
          throw new Error("Server not ready");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isMounted) {
          setBackendStatus("sleeping");
          startPolling();
        }
      }
    };

    const startPolling = () => {
      if (pollIntervalId) return;

      pollIntervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
          if (res.ok && isMounted) {
            setBackendStatus("online");
            if (pollIntervalId) {
              clearInterval(pollIntervalId);
              pollIntervalId = null;
            }
          }
        } catch (err) {
          // Keep polling
        }
      }, 3000);
    };

    performHealthCheck();

    return () => {
      isMounted = false;
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, []);

  // 3. Progress bar animation when sleeping
  useEffect(() => {
    if (status === "sleeping") {
      setProgress(0);
      setShowSuccessIcon(false);
      const duration = 45; // target 45 seconds
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95; // hold at 95% until online
          return prev + 100 / duration;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (status === "online") {
      setProgress(100);
      setShowSuccessIcon(true);
      
      // Delay closing/hiding of any overlays to show success animation
      const timer = setTimeout(() => {
        setShowSuccessIcon(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Determine if we should show the blocking overlay
  const showOverlay =
    (status === "sleeping" || (status === "checking" && activeRequests > 0)) &&
    activeRequests > 0 &&
    !isOverlayDismissed;

  return (
    <BackendStatusContext.Provider value={{ status, activeRequests }}>
      {children}

      {/* Floating Status Banner */}
      {status === "sleeping" && !isBannerDismissed && (
        <div className="mm-backend-banner">
          <div className="mm-backend-banner-pulse" />
          <span>🔌 Backend server sleeping. Waking up (takes ~45s). Browse UI while we connect...</span>
          <button
            onClick={() => setIsBannerDismissed(true)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              marginLeft: "12px",
              fontSize: "16px",
              fontWeight: 800,
              padding: "0 4px",
              lineHeight: 1,
            }}
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Blocking Action Overlay */}
      {showOverlay && (
        <div className="mm-backend-overlay">
          <div className="mm-backend-overlay-card">
            {showSuccessIcon ? (
              <div className="mm-backend-success-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="mm-backend-overlay-icon">
                <div className="mm-backend-overlay-spinner" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            )}

            <h2>{showSuccessIcon ? "Server Connected!" : "Connecting to Server..."}</h2>
            <p>
              {showSuccessIcon
                ? "The backend database & services are online. Resuming your request..."
                : "This website is a showcase project hosted on a free Render server. To save resources, the server spins down during inactivity. It is currently warming up, which can take 30-50 seconds. Your action is paused and will complete automatically once online!"}
            </p>

            <div className="mm-backend-progress-bg">
              <div
                className="mm-backend-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            {!showSuccessIcon && (
              <button
                className="mm-backend-dismiss-btn"
                onClick={() => setIsOverlayDismissed(true)}
              >
                Dismiss & Browse Offline
              </button>
            )}
          </div>
        </div>
      )}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error("useBackendStatus must be used within a BackendStatusProvider");
  }
  return context;
}
