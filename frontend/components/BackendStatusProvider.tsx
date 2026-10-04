"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(
  undefined
);

export function BackendStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatusState] = useState<BackendStatus>("checking");
  const [activeRequests, setActiveRequests] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting to Nexcart services...");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const mountTimeRef = useRef<number>(Date.now());
  const isInitialCheckDone = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Subscribe to global status & active requests
  useEffect(() => {
    const unsubStatus = subscribeBackendStatus((newStatus) => {
      setStatusState(newStatus);
    });

    const unsubRequests = subscribeActiveRequests((count) => {
      setActiveRequests(count);
    });

    return () => {
      unsubStatus();
      unsubRequests();
    };
  }, []);

  // 2. Health check and polling logic
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
        if (res.ok) {
          setBackendStatus("online");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexcart_backend_warm", "true");
          }
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch {
        // Render free-tier cold start in progress — continue polling
      }
    }, 2500);
  }, []);

  const performHealthCheck = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus("online");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("nexcart_backend_warm", "true");
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        throw new Error("Server not ready");
      }
    } catch {
      clearTimeout(timeoutId);
      setBackendStatus("sleeping");
      startPolling();
    } finally {
      isInitialCheckDone.current = true;
      setIsRetrying(false);
    }
  }, [startPolling]);

  // Initial check on mount
  useEffect(() => {
    mountTimeRef.current = Date.now();
    performHealthCheck();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [performHealthCheck]);

  // 3. Splash Loading Screen Lifecycle
  useEffect(() => {
    const isWarmSession =
      typeof window !== "undefined" &&
      sessionStorage.getItem("nexcart_backend_warm") === "true";

    // If backend is already online and this session was previously warmed up, skip splash
    if (status === "online" && isWarmSession && isInitialCheckDone.current) {
      setShowSplash(false);
      return;
    }

    setShowSplash(true);

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - mountTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (status !== "online") {
        // Smooth asymptotic progress advance towards 90% while server spins up
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const delta = Math.max(0.2, (90 - prev) * 0.035);
          return Math.min(90, +(prev + delta).toFixed(1));
        });

        // Informative, friendly status messages for Render free tier cold starts
        if (elapsed < 3) {
          setStatusMessage("Connecting to Nexcart services...");
        } else if (elapsed < 14) {
          setStatusMessage("Waking up cloud server (Render free tier spin-up)...");
        } else if (elapsed < 30) {
          setStatusMessage("Almost there! Initializing database & catalog...");
        } else if (elapsed < 55) {
          setStatusMessage("Cloud server finishing boot sequence...");
        } else {
          setStatusMessage("Server is taking longer than usual to wake up.");
        }
      } else {
        // Backend is ONLINE!
        setStatusMessage("Server connected! Loading storefront...");
        setProgress(100);
        clearInterval(timer);

        // Ensure a minimum splash display duration (1200ms) for smooth visual feel
        const totalElapsedMs = Date.now() - mountTimeRef.current;
        const remainingMinTime = Math.max(0, 1200 - totalElapsedMs);

        const fadeOutTimer = setTimeout(() => {
          setIsFadingOut(true);
          const hideTimer = setTimeout(() => {
            setShowSplash(false);
          }, 500);
          return () => clearTimeout(hideTimer);
        }, remainingMinTime + 300);

        return () => clearTimeout(fadeOutTimer);
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [status]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setStatusMessage("Retrying connection to cloud server...");
    performHealthCheck();
  };

  return (
    <BackendStatusContext.Provider value={{ status, activeRequests }}>
      {children}

      {/* Premium Full-Screen Splash Loading Screen */}
      {showSplash && (
        <div
          className={`mm-splash-screen ${isFadingOut ? "mm-splash-fade-out" : ""}`}
        >
          <div className="mm-splash-ambient-glow-1" />
          <div className="mm-splash-ambient-glow-2" />

          <div className="mm-splash-content">
            <div className="mm-splash-logo-container">
              <div className="mm-splash-icon-wrapper">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mm-splash-cart-icon"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h1 className="mm-splash-logo-text">
                Nex<span className="mm-splash-logo-accent">cart</span>
              </h1>
              <p className="mm-splash-tagline">
                ELEVATE YOUR SHOPPING EXPERIENCE
              </p>
            </div>

            <div className="mm-splash-loader-wrapper">
              <div className="mm-splash-progress-track">
                <div
                  className="mm-splash-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Live status text & pulse indicator */}
              <div className="mm-splash-status-message">
                <span className={`mm-splash-status-dot ${status}`} />
                <span>{statusMessage}</span>
              </div>

              {/* Fallback retry if Render cold start takes longer than 55s */}
              {elapsedSeconds >= 55 && status !== "online" && (
                <button
                  type="button"
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  className="mm-splash-retry-btn"
                >
                  {isRetrying ? "Checking..." : "Retry Connection"}
                </button>
              )}
            </div>
          </div>

          <div className="mm-splash-footer">
            <div className="mm-splash-footer-brand">Nexcart</div>
            <div className="mm-splash-footer-copyright">
              © 2026 Nexcart. All rights reserved.
            </div>
            <div className="mm-splash-footer-dev">
              Multi-Vendor E-Commerce Platform Developed By{" "}
              <span className="mm-splash-dev-name">Alan Joy Wilson</span>
            </div>
          </div>
        </div>
      )}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error(
      "useBackendStatus must be used within a BackendStatusProvider"
    );
  }
  return context;
}
