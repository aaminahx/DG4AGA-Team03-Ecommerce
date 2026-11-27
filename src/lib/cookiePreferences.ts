
export const COOKIE_STORAGE_KEY = "ecohome-cookie-preferences";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
};

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
};

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(COOKIE_STORAGE_KEY);

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);

    if (typeof parsed.analytics !== "boolean") {
      return null;
    }

    return {
      essential: true,
      analytics: parsed.analytics,
    };
  } catch {
    return null;
  }
}

export function saveCookiePreferences(
  preferences: CookiePreferences
) {
  localStorage.setItem(
    COOKIE_STORAGE_KEY,
    JSON.stringify(preferences)
  );

  window.dispatchEvent(
    new Event("cookie-preferences-updated")
  );
}

