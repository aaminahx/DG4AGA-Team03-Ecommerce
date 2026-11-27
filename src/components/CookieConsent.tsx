
"use client";

import { useEffect, useState } from "react";
import {
  getCookiePreferences,
  saveCookiePreferences,
  CookiePreferences,
} from "../lib/cookiePreferences";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    function loadPreferences() {
      const saved = getCookiePreferences();

      if (saved) {
        setAnalytics(saved.analytics);
        setShowBanner(false);
      } else {
        setAnalytics(false);
        setShowBanner(true);
      }
    }

    loadPreferences();

    window.addEventListener(
      "open-cookie-settings",
      () => setShowBanner(true)
    );

    window.addEventListener(
      "cookie-preferences-updated",
      loadPreferences
    );

    return () => {
      window.removeEventListener(
        "cookie-preferences-updated",
        loadPreferences
      );
    };
  }, []);

  function saveChoice(value: boolean) {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: value,
    };

    saveCookiePreferences(preferences);
    setAnalytics(value);
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      <div className="cookie-banner-content">
        <span className="eyebrow">
          ECOHOME / YOUR PRIVACY
        </span>

        <h2 id="cookie-title">
          We value your privacy 🍃
        </h2>

        <p>
          We use essential browser storage to help
          EcoHome work properly. You can choose
          whether to allow optional analytics.
        </p>

        <div className="cookie-category">
          <div>
            <strong>Essential storage</strong>
            <p>Required for core website functionality.</p>
          </div>

          <span className="cookie-required">
            Always active
          </span>
        </div>

        <div className="cookie-category">
          <div>
            <strong>Analytics</strong>
            <p>Optional website usage tracking.</p>
          </div>

          <span className="cookie-optional">
            {analytics ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="cookie-actions">
          <button
            type="button"
            className="cookie-reject"
            onClick={() => saveChoice(false)}
          >
            Reject optional
          </button>

          <button
            type="button"
            className="cookie-accept"
            onClick={() => saveChoice(true)}
          >
            Accept all
          </button>
        </div>

        <p className="cookie-note">
          You can change your preferences at any
          time through our Cookie Policy page.
        </p>
      </div>
    </div>
  );
}


