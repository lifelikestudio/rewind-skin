/**
 * Rewind Skin — outbound link tracking for Umami.
 *
 * A delegated capture-phase listener covers links rendered after page load
 * without adding Umami's per-element event attributes.
 */
(() => {
  'use strict';

  const OUTBOUND_CONFIG = {
    hosts: {
      'rewindskinco-book.as.me': { event: 'booking-cta-click' },
      'www.instagram.com': {
        event: 'social-profile-click',
        props: { network: 'instagram' },
      },
      'ca.linkedin.com': {
        event: 'social-profile-click',
        props: { network: 'linkedin' },
      },
      'www.tiktok.com': {
        event: 'social-profile-click',
        props: { network: 'tiktok' },
      },
    },
    sameSiteHosts: ['account.rewindskinco.com'],
    bookingRootPath: '/schedule/4a0c3baa',
    bookingManageEvent: 'booking-manage-click',
  };

  const resolvePlacement = (anchor) => {
    const explicit = anchor.closest('[data-rs-placement]');
    if (explicit) return explicit.dataset.rsPlacement;

    const section = anchor.closest('[data-section-type], .shopify-section');
    if (!section) return 'unknown';

    return section.dataset.sectionType || section.id || 'unknown';
  };

  const buildEvent = (anchor, url) => {
    const match = OUTBOUND_CONFIG.hosts[url.hostname];
    if (!match) return null;

    let eventName = match.event;
    const props = {
      destination: url.href,
      placement: resolvePlacement(anchor),
      ...(match.props || {}),
    };

    const isBookingRoot =
      url.pathname.replace(/\/$/, '') === OUTBOUND_CONFIG.bookingRootPath;
    const hasAppointmentContext =
      url.search.length > 0 || Boolean(anchor.dataset.rsTreatment);

    if (
      eventName === 'booking-cta-click' &&
      isBookingRoot &&
      !hasAppointmentContext
    ) {
      eventName = OUTBOUND_CONFIG.bookingManageEvent;
    }

    const { rsTreatment, rsCategory } = anchor.dataset;
    if (rsTreatment) props.treatment = rsTreatment;
    if (rsCategory) props.category = rsCategory;

    return { eventName, props };
  };

  document.addEventListener(
    'click',
    (event) => {
      if (typeof window.umami?.track !== 'function') return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest('a[href]');
      if (!anchor) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (url.hostname === window.location.hostname) return;
      if (OUTBOUND_CONFIG.sameSiteHosts.includes(url.hostname)) return;

      const tracked = buildEvent(anchor, url);
      if (!tracked) return;

      window.umami.track(tracked.eventName, tracked.props);
    },
    true
  );
})();
