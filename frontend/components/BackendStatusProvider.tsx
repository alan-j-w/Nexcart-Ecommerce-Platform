"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const isInitialCheckDone = useRef(false);

  // 1. Subscribe to global state
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

  // 2. Perform health check and handle polling
  useEffect(() => {
    let isMounted = true;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;

    const performHealthCheck = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (response.ok && isMounted) {
          setBackendStatus("online");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexcart_backend_warm", "true");
          }
        } else {
          throw new Error("Server not ready");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isMounted) {
          setBackendStatus("sleeping");
          startPolling();
        }
      } finally {
        isInitialCheckDone.current = true;
      }
    };

    const startPolling = () => {
      if (pollIntervalId) return;

      pollIntervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
          if (res.ok && isMounted) {
            setBackendStatus("online");
            if (typeof window !== "undefined") {
              sessionStorage.setItem("nexcart_backend_warm", "true");
            }
            if (pollIntervalId) {
              clearInterval(pollIntervalId);
              pollIntervalId = null;
            }
          }
        } catch (err) {
          // Keep polling
        }
      }, 2000);
    };

    performHealthCheck();

    return () => {
      isMounted = false;
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, []);

  // 3. Dynamic Backend-Responsive Splash Loading Screen
  useEffect(() => {
    let isMounted = true;

    // Check if user is on a warm active session
    const isWarmSession = typeof window !== "undefined" && sessionStorage.getItem("nexcart_backend_warm") === "true";

    // If backend is already online and session is warm, skip splash screen on refresh!
    if (status === "online" && isWarmSession && isInitialCheckDone.current) {
      setShowSplash(false);
      return;
    }

    setShowSplash(true);
    setIsFadingOut(false);

    // Standard loading screen duration (10 seconds)
    const STANDARD_DURATION = 10000;
    const intervalTime = 100;
    let currentStep = 0;
    const totalSteps = STANDARD_DURATION / intervalTime;

    const timer = setInterval(() => {
      currentStep++;

      // Condition: If backend responds online at any point, fast-forward to 100% and redirect immediately!
      if (status === "online") {
        clearInterval(timer);
        if (isMounted) {
          setProgress(100);
          const fadeTimer = setTimeout(() => {
            if (isMounted) setIsFadingOut(true);
          }, 200);
          const hideTimer = setTimeout(() => {
            if (isMounted) setShowSplash(false);
          }, 600);
        }
        return;
      }

      // Progress smoothly advances up to 95% over 10 seconds while waiting for backend
      const calculatedProgress = Math.min(95, Math.round((currentStep / totalSteps) * 95));
      if (isMounted) {
        setProgress(calculatedProgress);
      }

      // Standard timeout reached (10s)
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        if (isMounted) {
          setProgress(100);
          setIsFadingOut(true);
          setTimeout(() => {
            if (isMounted) setShowSplash(false);
          }, 500);
        }
      }
    }, intervalTime);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [status]);

  const handleDismissSplash = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  return (
    <BackendStatusContext.Provider value={{ status, activeRequests }}>
      {children}

      {/* Premium Full-Screen Splash Loading Screen */}
      {showSplash && (
        <div
          className={`mm-splash-screen ${isFadingOut ? "mm-splash-fade-out" : ""}`}
          onClick={handleDismissSplash}
          title="Click to continue"
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
                Premium Brands • Exclusive Deals • Your Ultimate Shopping Experience
              </p>
            </div>

            <div className="mm-splash-loader-wrapper">
              <div className="mm-splash-progress-track">
                <div
                  className="mm-splash-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
    throw new Error("useBackendStatus must be used within a BackendStatusProvider");
  }
  return context;
}

