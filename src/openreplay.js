import OpenReplay from '@openreplay/tracker';

/**
 * Rewind Skin — OpenReplay trial tracker.
 *
 * This bundle is requested by openreplay-loader.js only after analytics consent.
 * Do not identify visitors or enable request/response payload capture.
 */
(() => {
  'use strict';

  const productionHosts = ['rewindskinco.com', 'www.rewindskinco.com'];
  const isPublishedTheme = window.Shopify?.theme?.role === 'main';

  if (
    !productionHosts.includes(window.location.hostname) ||
    !isPublishedTheme ||
    window.Shopify?.designMode ||
    window.Shopify?.visualPreviewMode
  ) {
    return;
  }

  const tracker = new OpenReplay({
    projectKey: 'TdPH5fPbMY6PSejchmTV',
    respectDoNotTrack: true,
    defaultInputMode: 2,
    obscureTextEmails: true,
    obscureInputEmails: true,
    obscureInputNumbers: true,
    obscureInputDates: true,
    consoleMethods: null,
    network: {
      capturePayload: false,
      ignoreHeaders: true,
    },
    analytics: {
      active: true,
    },
  });

  let consentAllowed = false;
  let startInFlight = null;

  const analyticsAllowed = () =>
    window.Shopify?.customerPrivacy?.analyticsProcessingAllowed?.() === true;

  const isOpenReplayKey = (key) =>
    key.startsWith('__openreplay_') ||
    key.startsWith('__or_') ||
    key.startsWith('$__or__');

  const clearOpenReplayStorage = () => {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
      try {
        Object.keys(storage)
          .filter(isOpenReplayKey)
          .forEach((key) => storage.removeItem(key));
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    });
  };

  const stopTracker = () => {
    consentAllowed = false;

    if (tracker.isActive()) {
      tracker.stop();
    }

    clearOpenReplayStorage();
  };

  const startTracker = () => {
    consentAllowed = true;

    if (tracker.isActive() || startInFlight) return;

    startInFlight = tracker
      .start()
      .then(() => {
        if (!consentAllowed) stopTracker();
      })
      .catch(() => {
        if (!consentAllowed) clearOpenReplayStorage();
      })
      .finally(() => {
        startInFlight = null;
      });
  };

  const syncConsent = (allowed = analyticsAllowed()) => {
    if (allowed) {
      startTracker();
    } else {
      stopTracker();
    }
  };

  document.addEventListener('rewind:analytics-consent', (event) => {
    syncConsent(event.detail?.allowed === true);
  });
  document.addEventListener('visitorConsentCollected', () => syncConsent());

  syncConsent();
})();
