# Rewind Skin — OpenReplay Trial Install

Context for installing the OpenReplay tracker in the Shopify theme for a two-week evaluation. Implementation approach is yours. What follows is the situation, the constraints that aren't negotiable, and the things about this site that aren't obvious from reading the theme.

---

## Why we're doing this

Rewind currently runs five analytics tools: Shopify Analytics, GA4, Umami Cloud, Heap and Hotjar. Heap and Hotjar are both Contentsquare products and both are coming out. OpenReplay is the candidate replacement.

This is a **trial on OpenReplay's Serverless cloud tier**, running alongside everything else. Nothing gets removed yet.

Two questions it needs to answer:

1. Does OpenReplay surface usability issues well enough to replace Hotjar?
2. Does OpenReplay's built-in **Web Analytics** cover what Umami is currently used for? If so, Umami comes out too.

The second one is easy to overlook while absorbed in replays. It's the difference between ending at three tools or four.

---

## What's unusual about this site

**Neither conversion happens on the storefront.** Treatments book through Acuity on `rewindskinco-book.as.me`. Products check out on Shopify's checkout, which doesn't render `theme.liquid`. So the tracker measures intent, not conversion, and that's accepted rather than a problem to solve here.

**`account.rewindskinco.com` is first-party** (Shopify customer accounts) but a different hostname. It bites anything doing naive same-host logic.

**Treatment cards render client-side.** Category headings are in the server HTML; the individual treatment links are not. This is the site's primary booking surface, so anything depending on elements existing at page load will miss it. If replays don't capture these properly, the evaluation is moot.

**Load performance is part of the brand.** This is a design-led luxury site and we're already carrying five trackers. Worth knowing what the sixth costs.

---

## Hard constraints

These aren't preferences. They come from the nature of the business, not from tooling.

**No user identification. No `setUserID()`, no email, no anything that resolves to a person.** Rewind offers injectables, laser hair removal and microneedling. Treatment interest is health-adjacent. There's a standing rule that client email never enters an analytics tool, and replay makes this sharper than it is for ordinary analytics, because identification turns a recording into surveillance of a named individual. If user-level analysis is ever needed it goes through the Acuity API as a separate project.

**No network request/response body capture.** The Contact and Enroll forms post name and email through Typeform's API. Capturing bodies routes PII into replay through a side door.

**Inputs should be ignored, not merely obscured.** Obscured still preserves keystroke length and timing. There's nothing in Rewind's form inputs worth the exposure, and search behaviour is better measured in Shopify.

**Names need explicit handling.** OpenReplay's defaults cover emails and (optionally) numbers, but not names. Anywhere the theme renders customer name data needs hiding. Grep for `customer.` to find them; there are likely more surfaces than expected.

**Check the consent manager.** Mirror how Hotjar is currently gated, and verify what OpenReplay actually writes to storage rather than assuming it's cookieless.

---

## Worth considering as you go

Not instructions, just things that might change your approach.

OpenReplay autocaptures user activity and supports searching without prior instrumentation. That may mean far less custom event code than a tool like Umami needs. Worth establishing early, since it affects how much work the eventual shared dispatcher has to do.

There's an existing Umami event taxonomy on the site worth looking at before inventing a parallel one: event names describe the action (`booking-cta-click`, `booking-manage-click`, `social-profile-click`) and all variance lives in properties (`destination`, `placement`, `treatment`, `category`). Placement is authored as `data-rs-placement` on container wrappers and resolves to one of eight UI surfaces. Treatment and category are authored in Liquid because Acuity URLs genuinely can't be parsed for them — seven URL formats, many-to-many relationships.

OpenReplay has a metadata concept distinct from user identification. It may be the right home for that context without touching the identification constraint above.

Existing tools stay untouched during the trial. Six scripts briefly is fine; refactoring mid-evaluation isn't.

---

## What good looks like at the end

Sessions replay end to end across page loads (this is a multi-page Liquid site, not an SPA, and OpenReplay has known troubleshooting around that). Treatment cards appear correctly. No input values or customer names visible in any replay. No measurable load regression. And a clear answer on whether Web Analytics makes Umami redundant.

---

## Open items elsewhere, not blocking this

- Umami CSV export, both sites — rolling six-month window, actively dropping data
- GA4 retention → 14 months
- Heap raw event export — request pending
- Hotjar manual capture pass before cancellation
- Self-hosting decision: DigitalOcean Toronto, pending trial outcome
- Free tier is 1,000 sessions/month against ~1,500 actual, and 7-day retention. Enable usage-based billing so the month doesn't truncate.
