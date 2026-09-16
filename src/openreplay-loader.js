/**
 * Loads OpenReplay only after Shopify reports that analytics processing is
 * allowed. GetTerms synchronizes its Analytics preference with this API.
 */
(() => {
  'use strict';

  const loaderScript = document.currentScript;
  const trackerSrc = loaderScript?.dataset.openreplayTrackerSrc;
  const productionHosts = ['rewindskinco.com', 'www.rewindskinco.com'];
  const isPublishedTheme = window.Shopify?.theme?.role === 'main';

  if (
    !trackerSrc ||
    !productionHosts.includes(window.location.hostname) ||
    !isPublishedTheme ||
    window.Shopify?.designMode ||
    window.Shopify?.visualPreviewMode
  ) {
    return;
  }

  let trackerRequested = false;

  const analyticsAllowed = () =>
    window.Shopify?.customerPrivacy?.analyticsProcessingAllowed?.() === true;

  const publishConsent = () => {
    const allowed = analyticsAllowed();

    document.dispatchEvent(
      new CustomEvent('rewind:analytics-consent', {
        detail: { allowed },
      })
    );

    if (!allowed || trackerRequested) return;

    trackerRequested = true;

    const trackerScript = document.createElement('script');
    trackerScript.src = trackerSrc;
    trackerScript.async = true;
    trackerScript.addEventListener('load', publishConsent, { once: true });
    document.head.appendChild(trackerScript);
  };

  document.addEventListener('shopifyCustomerPrivacyApiLoaded', publishConsent);
  document.addEventListener('visitorConsentCollected', publishConsent);
  document.addEventListener('trackingConsentAccepted', publishConsent);

  publishConsent();
})();
