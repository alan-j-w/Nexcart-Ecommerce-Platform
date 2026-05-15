/**
 * Utility to detect if the application is running inside an in-app browser (WebView)
 * common in social media apps like LinkedIn, Facebook, Instagram, etc.
 * Google OAuth is typically blocked in these environments.
 */

export const isInAppBrowser = (): boolean => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // Specific Apps
  const isLinkedIn = /LinkedInApp/i.test(ua) || /LinkedIn/i.test(ua);
  const isFacebook = /FBAN|FBAV/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isWhatsApp = /WhatsApp/i.test(ua);
  const isTikTok = /TikTok/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);
  const isPinterest = /Pinterest/i.test(ua);
  const isTwitter = /Twitter|TwitterAndroid|t.co/i.test(ua);
  const isDiscord = /Discord/i.test(ua);
  const isMessenger = /Messenger/i.test(ua);

  if (
    isLinkedIn || isFacebook || isInstagram || isWhatsApp || 
    isTikTok || isSnapchat || isPinterest || isTwitter || 
    isDiscord || isMessenger
  ) {
    return true;
  }

  // Generic Android WebView detection
  // "wv" is a common marker in Android webview UAs
  if (/Android/i.test(ua) && /wv/i.test(ua)) {
    return true;
  }

  // iOS WebView detection (non-Safari browsers on iOS)
  // Safari on iOS contains "Safari" and NO "CriOS", "FxiOS", etc.
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isSafari = /Safari/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua) && !/EdgiOS/i.test(ua);
  const isStandalone = (window.navigator as any).standalone === true;

  // If it's iOS but not the standalone Safari browser and not in home-screen mode
  if (isIOS && !isSafari && !isStandalone) {
    // Check if it's a known third-party browser on iOS
    const isChromeIOS = /CriOS/i.test(ua);
    const isFirefoxIOS = /FxiOS/i.test(ua);
    const isEdgeIOS = /EdgiOS/i.test(ua);
    
    // If it's not one of those, it's likely a webview (LinkedIn, FB, etc.)
    if (!isChromeIOS && !isFirefoxIOS && !isEdgeIOS) {
      return true;
    }
  }

  return false;
};

export const getBrowserRecommendation = (): { name: string; icon: string } => {
  if (typeof window === "undefined") return { name: "Chrome", icon: "" };

  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) {
    return { name: "Chrome", icon: "" };
  } else if (/iPad|iPhone|iPod/.test(ua)) {
    return { name: "Safari", icon: "" };
  }
  return { name: "Chrome", icon: "" };
};
