import { useState, useEffect } from "react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsent {
  timestamp: string;
  preferences: CookiePreferences;
}

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = () => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem("cookieConsent");

    if (!consent) {
      setHasConsent(false);
      setLoading(false);
      return;
    }

    try {
      const parsed: CookieConsent = JSON.parse(consent);
      setPreferences(parsed.preferences);
      setHasConsent(true);
    } catch {
      // Old format
      setHasConsent(consent === "accepted");
    }

    setLoading(false);
  };

  const hasFunctionalCookies = (): boolean => {
    return preferences?.functional === true;
  };

  const hasAnalyticsCookies = (): boolean => {
    return preferences?.analytics === true;
  };

  const hasMarketingCookies = (): boolean => {
    return preferences?.marketing === true;
  };

  const updateConsent = (newPreferences: CookiePreferences) => {
    const consent: CookieConsent = {
      timestamp: new Date().toISOString(),
      preferences: newPreferences,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setPreferences(newPreferences);
    setHasConsent(true);
  };

  const revokeConsent = () => {
    localStorage.removeItem("cookieConsent");
    setPreferences(null);
    setHasConsent(false);
  };

  return {
    hasConsent,
    preferences,
    loading,
    hasFunctionalCookies,
    hasAnalyticsCookies,
    hasMarketingCookies,
    updateConsent,
    revokeConsent,
  };
};

export default useCookieConsent;
