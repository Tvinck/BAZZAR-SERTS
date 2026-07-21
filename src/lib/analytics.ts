import { supabase } from './supabase';

// ─── Existing analytics ─────────────────────────────────────────────

export const trackEvent = async (eventName: 'views' | 'unique_visitors' | 'registrations' | 'add_to_cart' | 'orders') => {
  try {
    // Вызываем RPC-функцию, которую создали в Supabase
    await supabase.rpc('increment_bazzar_analytics', { col_name: eventName });
  } catch {
    // RPC function may not exist yet — silently ignore
  }
};

export const initAnalytics = () => {
  // Track unique visitors (once per day)
  const today = new Date().toISOString().split('T')[0];
  const lastVisit = localStorage.getItem('last_visit_date');

  if (lastVisit !== today) {
    trackEvent('unique_visitors');
    localStorage.setItem('last_visit_date', today);
  }

  // Capture UTM params on first load
  captureUtmParams();
};

// ─── UTM & Session Tracking ─────────────────────────────────────────

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

interface TrackingData {
  utm: UtmParams;
  sessionId: string;
  referrer: string;
  landingPage: string;
}

/**
 * Generate a UUID v4 string.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a session ID stored in sessionStorage.
 * Persists for the duration of the browser tab session.
 */
function getSessionId(): string {
  const STORAGE_KEY = 'bazzar_session_id';
  let sessionId = sessionStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Capture UTM parameters from the current URL on first page load.
 * Stores them in sessionStorage so they persist across SPA navigations
 * but reset on new sessions.
 */
function captureUtmParams(): void {
  const STORAGE_KEY = 'bazzar_utm_params';

  // Only capture once per session
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };

  // Only store if at least one UTM param is present
  const hasUtm = Object.values(utm).some((v) => v !== null);
  if (hasUtm) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  }
}

/**
 * Returns full tracking data including UTM params, session ID,
 * referrer, and landing page.
 */
export function getTrackingData(): TrackingData {
  const UTM_KEY = 'bazzar_utm_params';
  const LANDING_KEY = 'bazzar_landing_page';

  // Store landing page on first call
  if (!sessionStorage.getItem(LANDING_KEY)) {
    sessionStorage.setItem(LANDING_KEY, window.location.href);
  }

  // Parse stored UTM params or return empty
  let utm: UtmParams = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
  };

  const storedUtm = sessionStorage.getItem(UTM_KEY);
  if (storedUtm) {
    try {
      utm = JSON.parse(storedUtm);
    } catch {
      // ignore corrupted data
    }
  }

  return {
    utm,
    sessionId: getSessionId(),
    referrer: document.referrer || '',
    landingPage: sessionStorage.getItem(LANDING_KEY) || window.location.href,
  };
}
