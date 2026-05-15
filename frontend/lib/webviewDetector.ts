/**
 * Utility to detect if the application is running inside an in-app browser (WebView)
 * common in social media apps like LinkedIn, Facebook, Instagram, etc.
 * Google OAuth is typically blocked in these environments.
 */

export const isInAppBrowser = (): boolean => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // Specific Apps
  const isLinkedIn = /LinkedInApp/i.test(ua);
  const isFacebook = /FBAN|FBAV/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isWhatsApp = /WhatsApp/i.test(ua);
  const isTikTok = /TikTok/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);
  const isPinterest = /Pinterest/i.test(ua);
  const isTwitter = /Twitter|TwitterAndroid/i.test(ua);
  const isDiscord = /Discord/i.test(ua);
  const isSlack = /Slack/i.test(ua);

  if (isLinkedIn || isFacebook || isInstagram || isWhatsApp || isTikTok || isSnapchat || isPinterest || isTwitter || isDiscord || isSlack) {
    return true;
  }

  // Generic Android WebView detection
  if (/Android/i.test(ua) && /wv/i.test(ua)) {
    return true;
  }

  // Detect Google's specific block for WebViews (disallowed_useragent)
  // Sometimes we can detect it via the user agent containing "GSA" (Google Search App)
  const isGoogleSearchApp = /GSA\/[0-9.]+/i.test(ua);
  if (isGoogleSearchApp) return true;

  // iOS WebView detection (non-Safari browsers on iOS)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isSafari = /Safari/i.test(ua);
  const isChromeIOS = /CriOS/i.test(ua);
  const isFirefoxIOS = /FxiOS/i.test(ua);
  const isEdgeIOS = /EdgiOS/i.test(ua);
  const isOperaIOS = /OPiOS/i.test(ua);

  // If it's iOS but not any of the major standalone browsers
  if (isIOS && !isSafari && !isChromeIOS && !isFirefoxIOS && !isEdgeIOS && !isOperaIOS) {
    return true;
  }
  
  // Another iOS check: if it's iOS and the user agent doesn't contain "Safari" 
  // (Note: Chrome/Firefox on iOS contain "Safari" but also "CriOS"/"FxiOS")
  if (isIOS && !/Safari/i.test(ua)) {
    return true;
  }

  return false;
};

export const getBrowserRecommendation = (): { name: string; icon: string } => {
  if (typeof window === "undefined") return { name: "Chrome", icon: "🌐" };

  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) {
    return { name: "Chrome", icon: "🌐" };
  } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
    return { name: "Safari", icon: "🧭" };
  }
  return { name: "Chrome", icon: "🌐" };
};
