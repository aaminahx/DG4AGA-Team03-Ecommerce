
"use client";

import { useEffect, useState } from "react";
import {
  getCookiePreferences,
  saveCookiePreferences,
} from "@/lib/cookiePreferences";

export default function CookiesPage() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const preferences = getCookiePreferences();

    if (preferences) {
      setAnalytics(preferences.analytics);
    }
  }, []);

  function saveSettings(value: boolean) {
    saveCookiePreferences({
      essential: true,
      analytics: value,
    });

    setAnalytics(value);
    setSaved(true);
  }

  return (
    <section className="section info-page">
      <span className="eyebrow">
        ECOHOME / LEGAL
      </span>

      <h1>Cookie Policy</h1>

      <p>
        Manage your cookie preferences and learn
        how EcoHome uses cookies and browser storage.
      </p>

      <p>
        <strong>Last updated:</strong> 27/11/2026
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your
        device when you visit a website. Websites
        can also use browser storage to remember
        information between visits.
      </p>

      <h2>2. How EcoHome Uses Cookies</h2>
      <p>
        EcoHome uses browser storage to remember
        your cookie preferences and may use essential
        technologies to support website features.
      </p>

      <h2>3. Essential Storage</h2>
      <p>
        Essential storage supports core website
        functionality and cannot be disabled using
        the optional preference settings.
      </p>

      <h2>4. Analytics</h2>
      <p>
        Analytics technologies may help us understand
        how visitors use EcoHome. These should only
        be activated after the required consent has
        been obtained.
      </p>

      <h2>5. Manage Your Preferences</h2>
      <p>
        Your current saved preferences are shown
        below. You can change them whenever you wish.
      </p>

      <div className="cookie-preference">
        <h3>Essential storage</h3>

        <p>
          Required for important website functions
          and remembering your preferences.
        </p>

        <strong>Always enabled</strong>
      </div>

      <div className="cookie-preference">
        <h3>Analytics</h3>

        <p>
          Optional website usage tracking, if
          implemented.
        </p>

        <label className="cookie-toggle">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => {
              setAnalytics(e.target.checked);
              setSaved(false);
            }}
          />

          Allow analytics
        </label>
      </div>

      <div className="cookie-actions">
        <button
          type="button"
          className="cookie-accept"
          onClick={() => saveSettings(analytics)}
        >
          Save my preferences
        </button>

        <button
          type="button"
          className="cookie-reject"
          onClick={() => saveSettings(false)}
        >
          Reject optional
        </button>
      </div>

      {saved && (
        <p role="status">
          Your cookie preferences have been saved
          successfully!
        </p>
      )}

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy when
        necessary. Any changes will be published
        on this page.
      </p>
    </section>
  );
}

