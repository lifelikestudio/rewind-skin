# Rewind Skin — Umami Outbound Link Tracking

**Handoff for implementation in Cursor**
Date: 2026-09-08 · v01

---

## 1. Scope

Track clicks on outbound links from the Shopify storefront into Umami as custom events, using a single delegated listener rather than per-element data attributes.

**Covers:** Acuity booking links, Typeform forms, social profiles, brand sites.

Conversion tracking — confirming that a booking or an order actually completed — happens off-site and is handled separately.

---

## 2. Why a delegated listener, not `data-umami-event`

Umami's documented approach adds `data-umami-event` attributes to anchors. Two problems in this theme:

1. Umami's docs note that other event listeners inside the element will not be triggered when using the data attribute method. Anchors in this theme carry existing handlers (drawer triggers, quick-add, predictive search). Blanket tagging risks breaking them.
2. The auto-tagging script in Umami's docs runs once against the DOM at load. Anything injected later — cart drawer, predictive search results, Section Rendering API responses — never gets tagged.

A single delegated listener on `document` avoids both: it never touches the elements, and it resolves the anchor at click time, so dynamically injected links work automatically.

---

## 3. Event naming convention

**Principle: the event name describes the action. All variance goes into properties.**

If treatment names go into event names, you end up with forty event names and no way to aggregate. Umami's Events page has a Properties tab with a value breakdown per property, and the filter panel can narrow by property name and value — so properties are the right home for the variable parts.

Umami caps event names at 50 characters. Lowercase, hyphenated, prefix-grouped so related events cluster alphabetically in the dashboard.

### Event names

| Event | Fires on |
|---|---|
| `booking-cta-click` | Any link to a specific Acuity appointment type or category |
| `booking-manage-click` | "Manage Appointments" links (bare scheduler root) |
| `social-profile-click` | Instagram, LinkedIn, TikTok |

An earlier draft included a `brand-site-click` event. Dropped: every brand link on the site points to an internal collection (`/collections/adipeau`, `/collections/mansard`, and so on). There are no outbound brand links to track.

**Typeform is not an outbound link and is out of scope for this file.** The contact form and the Enroll opt-in are built against Typeform's API, so nothing navigates and no anchor is clicked. They need `umami.track()` calls placed inside the existing form handlers instead — see section 10.

### Properties

| Property | Applies to | Example |
|---|---|---|
| `destination` | all | `https://rewindskinco-book.as.me/light-facial` |
| `placement` | all | `nav-studio-featured`, `footer-legal`, `treatment-card` |
| `treatment` | booking | `light-facial`, `morpheus8`, `virtual-consult` |
| `category` | booking | `facials`, `injectables`, `skin-tightening` |
| `network` | social | `instagram`, `tiktok`, `linkedin` |

### Why `treatment` and `category` must be authored in Liquid

I argued this on principle in the first draft. The live site proves it.

**Seven distinct Acuity URL formats are in use:**

| Pattern | Example |
|---|---|
| Vanity slug | `/light-facial` |
| Full schedule path | `/schedule/4a0c3baa/category/FACIALS/appointment/49976109/calendar/3328226` |
| Appointment + calendar + query | `/schedule/4a0c3baa/appointment/75428092/calendar/3328226?appointmentTypeIds[]=75428092` |
| Root + categories array | `/schedule/4a0c3baa/?categories[]=SKINPEN™%20Microneedling` |
| Domain root + appointmentType | `/?appointmentType=category:DIOLAZE™%20Laser%20Hair%20Removal` |
| Legacy PHP path | `/schedule.php?appointmentType=category%3ACONSULTATIONS` |
| Bare scheduler root | `/schedule/4a0c3baa` |

**And the URL-to-treatment relationship is many-to-many:**

- `/nurse-led-treatments` serves three different labels across three categories — Neuromodulators under Injectables, Morpheus8 under Skin Improvement, Morpheus8 under Skin Tightening
- `/forma-plus` appears under both Body Contouring and Skin Tightening
- Appointment `75428092` is labelled **Concierge** in the Shop nav and **Virtual Consult** in the Studio nav

No parser can resolve that, because the information genuinely isn't in the URL. It's in the authoring context. Hence data attributes.

**Bonus:** this is a good illustration of why `placement` earns its keep. Concierge and Virtual Consult are the same appointment under two names in two nav positions. Without `placement` you can't tell which framing converts.

---

## 4. Config

Single source of truth at the top of the file. Renaming an event later should be one edit here, not a find-and-replace.

```js
const OUTBOUND_CONFIG = {
  // Map of hostname → { event, props }
  // Unlisted hosts are ignored. Verified against a full site link audit.
  hosts: {
    'rewindskinco-book.as.me': { event: 'booking-cta-click' },
    'www.instagram.com':       { event: 'social-profile-click', props: { network: 'instagram' } },
    'ca.linkedin.com':         { event: 'social-profile-click', props: { network: 'linkedin' } },
    'www.tiktok.com':          { event: 'social-profile-click', props: { network: 'tiktok' } },
  },

  // First-party hosts on a different hostname. Treated as internal,
  // never tracked as outbound. Shopify's new customer accounts live here.
  sameSiteHosts: ['account.rewindskinco.com'],

  // The bare scheduler root with no appointment context is
  // "manage appointments", not a treatment CTA.
  bookingRootPath: '/schedule/4a0c3baa',
  bookingManageEvent: 'booking-manage-click',
};
```

**On ShipStation:** the link audit surfaced one other genuine outbound destination, `shipstation.com/partners/xcover/` — shipping protection on the shipping and returns page. Deliberately excluded. A click there isn't a signal anyone would act on, and it would sit in the dashboard as a permanent single-member category diluting the events that matter. Revisit only if XCover becomes a revenue share, or if the link is a removal candidate and usage data would inform that.

**On `account.rewindskinco.com`:** this matters. It's a different hostname from `rewindskinco.com`, so the naive same-host check would treat it as external. It's first-party, so it belongs in `sameSiteHosts` rather than the allowlist. If account-area behaviour is worth measuring later, it should be its own piece of work, not an outbound event.

### Placement vocabulary

Describes the **UI surface**, not the page and not the device.

- **Not the page.** Umami records the page URL alongside every event, so page context is already available. A treatment card is `treatment-card` wherever it appears; slice by URL when you want to know which page drove it.
- **Not the device.** Umami segments by device in its own UI. Mobile and desktop share the same nav hierarchy here, so they share placement values too — filter by device when you want the split.

| Value | Surface | External links there |
|---|---|---|
| `nav-studio-featured` | Studio mega menu, Featured column | Virtual Consult |
| `nav-shop-featured` | Shop mega menu, Featured column | Concierge |
| `nav-studio-treatments` | Studio mega menu treatment lists | ~20 booking links |
| `nav-utility` | Utility bar at the bottom of the mega menu and mobile menu | Manage Appointments |
| `footer-legal` | Footer bottom row | Account, Manage Appointments, Terms, Privacy |
| `footer-social` | Footer Connect block | Instagram, LinkedIn, TikTok |
| `treatment-card` | Treatment listing cards, wherever they appear | Per-treatment booking |
| `treatment-analysis-cta` | Skin analysis block | "Begin" |

Complete. Every external link on the site resolves to one of these eight.

### Placing the attributes

**Author at the container level, not per link.** `resolvePlacement` walks up the DOM with `closest('[data-rs-placement]')`, so one attribute on a wrapper covers every link inside it. Seven or eight attributes across the theme, not forty-three.

```liquid
<div class="mega-menu__studio" data-rs-placement="nav-studio-treatments">
  <!-- every booking link inside inherits this placement -->
</div>
```

**Finding the right wrapper.** The attribute belongs on the outermost element that contains all the links for that surface and nothing from another surface. Practical method: find one known external link in the theme, walk up until you hit the element that wraps the whole surface, and tag that.

Two things to watch:

- **Split sections.** `nav-studio-treatments` covers roughly twenty links. If the mega menu is built from several Liquid sections or snippets rather than one wrapper, each needs the attribute. A missed wrapper doesn't error — those links silently fall back to whatever section sits above them, which is worse than an error because it looks like data.
- **Client-rendered cards.** Treatment cards aren't in the server-rendered HTML, so the attribute has to go into whatever renders them. Prefer the grid container over the individual card, so it exists in the DOM regardless of how the cards get injected.

Anything not explicitly tagged falls back to the nearest section's `data-section-type` or DOM id, so untagged surfaces still report something rather than breaking.

### Treatment naming — collision resolved

Two separate virtual consults exist and must not merge:

| Appointment | Context | `treatment` value |
|---|---|---|
| `75428092` | Labelled **Concierge** in the Shop nav and **Virtual Consult** in the Studio nav | `concierge-consult` |
| `18895326` | Current-client-only virtual consult, being sunsetted | `consult-clients` |

Keeping them distinct is what makes the sunset visible in the data.

---

## 5. Implementation

Place in a theme asset, loaded after the Umami tracker in `theme.liquid`.

```js
/**
 * Rewind Skin — outbound link tracking for Umami
 *
 * Delegated click listener. Resolves the anchor at click time, so links
 * injected after load (cart drawer, predictive search, section rendering)
 * are covered without re-initialisation.
 *
 * Authored metadata is read from data attributes on the anchor:
 *   data-rs-treatment  e.g. "light-facial"
 *   data-rs-category   e.g. "facials"
 *   data-rs-form       e.g. "contact"
 *   data-rs-placement  e.g. "treatment-hero"
 */

(() => {
  'use strict';

  const OUTBOUND_CONFIG = { /* see section 4 */ };

  /**
   * Resolve the placement value for a link.
   * Prefers an explicit attribute; falls back to the nearest section.
   */
  const resolvePlacement = (anchor) => {
    const explicit = anchor.closest('[data-rs-placement]');
    if (explicit) return explicit.dataset.rsPlacement;

    const section = anchor.closest('[data-section-type], .shopify-section');
    if (!section) return 'unknown';

    return section.dataset.sectionType || section.id || 'unknown';
  };

  /**
   * Build the event name and properties for a given anchor + URL.
   * Returns null if the host isn't in the allowlist.
   */
  const buildEvent = (anchor, url) => {
    const match = OUTBOUND_CONFIG.hosts[url.hostname];
    if (!match) return null;

    let eventName = match.event;

    const props = {
      destination: url.href,
      placement: resolvePlacement(anchor),
      ...(match.props || {}),
    };

    // Distinguish "manage appointments" from a treatment-specific CTA.
    // The bare scheduler root with no query string and no authored
    // treatment is the client's own appointment management page.
    const isBookingRoot =
      url.pathname.replace(/\/$/, '') === OUTBOUND_CONFIG.bookingRootPath;
    const hasAppointmentContext =
      url.search.length > 0 || Boolean(anchor.dataset.rsTreatment);

    if (eventName === 'booking-cta-click' && isBookingRoot && !hasAppointmentContext) {
      eventName = OUTBOUND_CONFIG.bookingManageEvent;
    }

    // Authored metadata — only attach what's present.
    const { rsTreatment, rsCategory, rsForm } = anchor.dataset;
    if (rsTreatment) props.treatment = rsTreatment;
    if (rsCategory) props.category = rsCategory;
    if (rsForm) props.form = rsForm;

    return { eventName, props };
  };

  document.addEventListener(
    'click',
    (event) => {
      // Bail early if the tracker didn't load (ad blocker, network failure).
      if (!window.umami) return;

      const anchor = event.target.closest('a[href]');
      if (!anchor) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return; // mailto:, tel:, malformed href
      }

      if (url.hostname === window.location.hostname) return;
      if (OUTBOUND_CONFIG.sameSiteHosts.includes(url.hostname)) return;

      const tracked = buildEvent(anchor, url);
      if (!tracked) return;

      window.umami.track(tracked.eventName, tracked.props);
    },
    true // capture phase — runs before handlers that may stopPropagation
  );
})();
```

---

## 6. Navigation race — largely resolved

When a link opens in the same tab, the browser may cancel the in-flight tracking request before it completes. Links opening in a new tab are unaffected because the current page keeps running.

All 44 hardcoded Acuity links use `target="_blank"`, so booking CTAs — the events that matter most here — are not at risk. No mitigation needed.

**Remaining exposure:** links authored through Shopify's navigation menus rather than hardcoded in Liquid, which don't carry `target="_blank"` by default. Worth an audit of the nav menu items during QA. If any booking links are menu-driven, either set them to open in a new tab or accept a small undercount on those specific placements.

---

## 7. Liquid changes needed

Add data attributes to booking links at their authoring points:

```liquid
<a
  href="{{ block.settings.booking_url }}"
  data-rs-treatment="{{ block.settings.treatment_handle }}"
  data-rs-category="{{ block.settings.treatment_category }}"
>
  {{ block.settings.label }}
</a>
```

Where booking links come from menu items rather than section settings, they'll fall back to `booking-cta-click` with `placement` only. That's acceptable for nav links — placement alone tells you the nav is working.

---

## 8. QA checklist

- [ ] Events appear in Umami with correct names and properties
- [ ] Existing anchor handlers still fire (cart drawer, predictive search, quick-add)
- [ ] Links inside the cart drawer are tracked
- [ ] "Manage Appointments" resolves to `booking-manage-click`, not `booking-cta-click`
- [ ] Same-site links produce no events
- [ ] `mailto:` and `tel:` links produce no errors
- [ ] Nothing breaks with the tracker blocked (ad blocker on)
- [ ] `placement` returns a real value, not `unknown`, on key templates

---

## 9. Status

No open questions. The allowlist, placement vocabulary and treatment naming are all confirmed against a full audit of external links on the site.

The one thing to verify during build rather than before it: that each of the eight placement surfaces reports the value you expect. A missed wrapper doesn't error — it falls back to the nearest section and reports a plausible but wrong value, which is harder to spot than a break.

---

## 10. Typeform — separate, in-page tracking

Not part of this build, but worth capturing while it's fresh.

Because the contact form and the Enroll opt-in run against Typeform's API rather than navigating anywhere, there's no anchor to intercept. They need `umami.track()` calls placed inside the existing handlers.

**This is better data, not worse.** An outbound link would only ever tell you someone left. Owning the flow means you can measure the full funnel:

| Event | Fires on |
|---|---|
| `form-open` | Form is launched |
| `form-submit` | Submission succeeds |

With `form` (`contact`, `enroll`) and `placement` as properties, so you can see which Enroll placements actually convert rather than just which get opened.

**Timing: build this into the rebuild, not before it.** Instrumenting the current implementation is wasted work if it's about to change. Agreeing the event shape now means tracking gets written alongside the new code rather than retrofitted onto it.

**Still a privacy policy item.** API integration doesn't change where the data goes. Name and email still reach Typeform's infrastructure, so they belong in the third-party list regardless of how the form is rendered.

**Use the same placement vocabulary.** Whatever surfaces the Enroll CTA appears on need `data-rs-placement` on their wrappers too, so form placements and booking placements are directly comparable.
