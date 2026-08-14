import { gsap } from 'gsap';

const DRAWER_SELECTOR = 'v3-cart-drawer[data-section-id]';
const NAV_TRIGGER_SELECTOR = '[data-nav-cart], [data-nav-cart-mobile]';
const CART_TRIGGER_SELECTOR = [
  NAV_TRIGGER_SELECTOR,
  '[data-submenu-bag]',
  '[data-mobile-menu-bag]',
].join(',');
const DEFAULT_CART_COPY = Object.freeze({
  item: 'item',
  items: 'items',
  adding: 'Adding…',
  addingAria: 'Adding item to bag',
  quantityUpdated: 'Quantity updated to __quantity__.',
  removed: 'Item removed from your bag.',
  added: 'Item added to your bag.',
  updateError: 'We could not update your bag.',
  updateConnectionError:
    'We could not update your bag. Check your connection and try again.',
  addError: 'We could not add this item to your bag.',
  addConnectionError:
    'We could not add this item to your bag. Check your connection and try again.',
  refreshUpdatedError:
    'Your bag was updated, but it could not be refreshed. Reload the page to see the latest items.',
  refreshAddedError:
    'The item was added, but your bag could not be refreshed. Reload the page to see the latest items.',
});
const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
const ADD_FEEDBACK_DELAY = 150;
const DRAWER_FEEDBACK_DELAY = 150;
const FALLBACK_ADD_ERROR_SELECTOR = '[data-cart-global-error]';
const MODAL_OWNER = 'cart';
const MOBILE_BREAKPOINT = 768;

let openTrigger = null;
let closeTimer = null;
let cartRevealTimeline = null;
let cartEmptyMorph = null;
let cartBackdropTransfer = null;
let mutationQueue = Promise.resolve();
const submitFeedbackRecords = new WeakMap();
const drawerBusyOperations = new Set();
const navigationCountTimelines = new WeakMap();
const navigationBadgeTimelines = new WeakMap();

function getDrawer() {
  return document.querySelector(DRAWER_SELECTOR);
}

function getCartCopy() {
  const source = getDrawer()?.querySelector('[data-cart-copy]');
  if (!source) return DEFAULT_CART_COPY;

  try {
    return { ...DEFAULT_CART_COPY, ...JSON.parse(source.textContent) };
  } catch {
    return DEFAULT_CART_COPY;
  }
}

function getBagLabel() {
  return getDrawer()?.dataset.cartLabel?.trim() || 'Bag';
}

function formatCartCopy(key, replacements = {}) {
  const copy = getCartCopy();
  return Object.entries(replacements).reduce(
    (message, [token, value]) =>
      message.replaceAll(`__${token}__`, String(value)),
    copy[key] || DEFAULT_CART_COPY[key] || ''
  );
}

function createFallbackModalCoordinator() {
  let activeOwner = null;
  let activeUsesBackdrop = false;
  let backdropCloseFrame = null;
  let inertRecords = [];
  let previousOverflow = '';

  function getBackdrop() {
    return document.querySelector('[data-v3-modal-backdrop]');
  }

  function showBackdrop() {
    const backdrop = getBackdrop();
    if (backdropCloseFrame !== null) {
      window.cancelAnimationFrame(backdropCloseFrame);
      backdropCloseFrame = null;
    }
    backdrop?.setAttribute('data-v3-modal-backdrop-open', '');
  }

  function scheduleBackdropClose() {
    if (backdropCloseFrame !== null) {
      window.cancelAnimationFrame(backdropCloseFrame);
    }
    backdropCloseFrame = window.requestAnimationFrame(() => {
      const backdrop = getBackdrop();
      backdropCloseFrame = null;
      if (!activeOwner || !activeUsesBackdrop) {
        backdrop?.removeAttribute('data-v3-modal-backdrop-open');
      }
    });
  }

  function clearIsolation() {
    inertRecords.forEach(({ element, wasInert }) => {
      if (wasInert) {
        element.inert = true;
      } else {
        element.inert = false;
        element.removeAttribute('inert');
      }
    });
    inertRecords = [];
  }

  function isCookieConsentHost(element) {
    return element.id === 'cookie-widget-app';
  }

  function applyIsolation(activeRoot) {
    let branch = activeRoot;
    let parent = branch?.parentElement;

    while (parent) {
      Array.from(parent.children).forEach((child) => {
        if (child === branch || isCookieConsentHost(child)) return;
        inertRecords.push({
          element: child,
          wasInert: child.inert || child.hasAttribute('inert'),
        });
        child.inert = true;
      });

      if (parent === document.body) break;
      branch = parent;
      parent = parent.parentElement;
    }
  }

  return {
    acquire(owner, activeRoot, options) {
      if (!owner || !activeRoot) return;

      if (activeOwner && activeOwner !== owner) {
        document.dispatchEvent(
          new CustomEvent('v3:modal-release-request', {
            detail: { owner: activeOwner, nextOwner: owner },
          })
        );
      }

      if (activeOwner && activeOwner !== owner) {
        clearIsolation();
        document.documentElement.style.overflow = previousOverflow;
        activeOwner = null;
        activeUsesBackdrop = false;
      }

      if (activeOwner !== owner) {
        previousOverflow = document.documentElement.style.overflow;
        activeOwner = owner;
      } else {
        clearIsolation();
      }

      document.documentElement.style.overflow = 'hidden';
      applyIsolation(activeRoot);
      activeUsesBackdrop = options?.useBackdrop !== false;
      if (activeUsesBackdrop) {
        showBackdrop();
      } else {
        scheduleBackdropClose();
      }
    },
    refresh(owner, activeRoot) {
      if (activeOwner !== owner || !activeRoot) return;
      clearIsolation();
      applyIsolation(activeRoot);
    },
    release(owner) {
      if (activeOwner !== owner) {
        if (!activeOwner) scheduleBackdropClose();
        return false;
      }
      clearIsolation();
      document.documentElement.style.overflow = previousOverflow;
      activeOwner = null;
      activeUsesBackdrop = false;
      scheduleBackdropClose();
      return true;
    },
    getOwner() {
      return activeOwner;
    },
  };
}

const modalCoordinator =
  window.RewindV3ModalCoordinator ||
  (window.RewindV3ModalCoordinator = createFallbackModalCoordinator());

function getRoutesRoot() {
  const root = window.Shopify?.routes?.root || '/';
  return root.endsWith('/') ? root : `${root}/`;
}

function getCartEndpoint(action) {
  return `${getRoutesRoot()}cart/${action}.js`;
}

function getSectionId() {
  return getDrawer()?.dataset.sectionId || '';
}

function closeCompetingDrawers() {
  const selectors = [
    '[data-search-drawer][data-search-state="open"] [data-search-close]',
    '[data-submenu][data-submenu-state="open"] [data-submenu-close]',
    '[data-mobile-menu][data-mobile-menu-state="open"] [data-mobile-menu-close]',
  ];

  selectors.forEach((selector) => {
    document.querySelector(selector)?.click();
  });
}

function getMobileMenuCartContext(trigger) {
  if (
    !(trigger instanceof HTMLElement) ||
    window.innerWidth >= MOBILE_BREAKPOINT
  ) {
    return null;
  }

  const mobileMenu = trigger.closest(
    '[data-mobile-menu][data-mobile-menu-state="open"]'
  );
  const mobilePanel = mobileMenu?.querySelector('.v3-mobile-menu__panel');
  const mobileClose = mobileMenu?.querySelector('[data-mobile-menu-close]');
  if (!mobileMenu || !mobilePanel || !mobileClose) return null;

  return {
    mobileMenu,
    mobilePanel,
    mobileClose,
    content: [
      mobileMenu.querySelector('.v3-mobile-menu__heading'),
      mobileMenu.querySelector('.v3-mobile-menu__toggle-wrap'),
      mobileMenu.querySelector('.v3-mobile-menu__nav'),
      mobileMenu.querySelector('.v3-mobile-menu__utility'),
    ].filter(Boolean),
  };
}

function prepareCartBackdropTransfer(mobilePanel) {
  const panelRect = mobilePanel.getBoundingClientRect();
  const panelStyles = window.getComputedStyle(mobilePanel);
  const backdrop = document.querySelector('[data-v3-modal-backdrop]');
  if (!backdrop) return null;

  const backdropStyles = window.getComputedStyle(backdrop);
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const clip = [
    Math.max(0, panelRect.top),
    Math.max(0, viewportWidth - panelRect.right),
    Math.max(0, viewportHeight - panelRect.bottom),
    Math.max(0, panelRect.left),
  ];

  gsap.set(backdrop, {
    clipPath: `inset(${clip.join('px ')}px round ${panelStyles.borderRadius})`,
    backgroundColor: panelStyles.backgroundColor,
    backdropFilter: panelStyles.backdropFilter,
    webkitBackdropFilter: panelStyles.webkitBackdropFilter,
    opacity: 0,
    transition: 'none',
    willChange: 'clip-path, background-color, backdrop-filter',
  });

  return {
    backdrop,
    backdropBackground: backdropStyles.backgroundColor,
    backdropFilter: backdropStyles.backdropFilter,
    backdropWebkitFilter: backdropStyles.webkitBackdropFilter,
  };
}

function clearCartBackdropTransfer({ preserveBackdrop = false } = {}) {
  if (!cartBackdropTransfer) return;

  const { timeline, backdrop, mobileMenu, mobilePanel, content } =
    cartBackdropTransfer;

  if (!preserveBackdrop) timeline?.kill();
  gsap.killTweensOf([mobilePanel, ...content]);
  gsap.set(mobilePanel, { clearProps: 'opacity' });
  gsap.set(content, { clearProps: 'opacity' });
  mobileMenu.removeAttribute('data-drawer-transfer');

  if (preserveBackdrop) {
    cartBackdropTransfer.timeline = null;
    return;
  }

  gsap.killTweensOf(backdrop);
  gsap.set(backdrop, {
    clearProps:
      'opacity,clipPath,backgroundColor,backdropFilter,webkitBackdropFilter,transition,willChange',
  });
  const drawer = getDrawer();
  if (drawer?.dataset.cartState === 'opening') {
    drawer.dataset.cartState = 'closed';
    drawer.setAttribute('aria-hidden', 'true');
  }
  cartBackdropTransfer = null;
}

function transferMobileMenuToCart(trigger, drawer, context, revealLineKeys) {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  openTrigger = getReturnFocusTarget(trigger);

  const openCart = () => {
    context.mobileClose.click();
    drawer.dataset.cartState = 'open';
    drawer.setAttribute('aria-hidden', 'false');
    syncTriggerExpansion(true);
    modalCoordinator.acquire(MODAL_OWNER, drawer, { useBackdrop: true });
    syncDrawerBusy(drawer);
    playCartReveal(drawer, revealLineKeys, 0.3);
    focusReplacement(drawer, '[data-cart-close]');
  };

  if (reducedMotion) {
    openCart();
    return;
  }

  const backdropTransfer = prepareCartBackdropTransfer(context.mobilePanel);
  if (!backdropTransfer) {
    openCart();
    return;
  }

  const { backdrop, backdropBackground, backdropFilter, backdropWebkitFilter } =
    backdropTransfer;

  context.mobileMenu.setAttribute('data-drawer-transfer', '');
  drawer.dataset.cartState = 'opening';
  gsap.killTweensOf([context.mobilePanel, ...context.content]);
  gsap.set(context.content, { opacity: 1 });

  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'power1.out' },
    onComplete: () => clearCartBackdropTransfer({ preserveBackdrop: true }),
  });

  cartBackdropTransfer = {
    timeline,
    backdrop,
    ...context,
  };

  timeline.to(
    context.content,
    {
      opacity: 0,
      duration: 0.15,
    },
    0
  );
  timeline.call(
    () => {
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(context.mobilePanel, { opacity: 0 });
    },
    null,
    0.12
  );
  timeline.to(
    backdrop,
    {
      clipPath: 'inset(0px round 0px)',
      backgroundColor: backdropBackground,
      backdropFilter,
      webkitBackdropFilter: backdropWebkitFilter,
      duration: 0.3,
      ease: 'power2.inOut',
    },
    0.12
  );
  timeline.call(
    () => {
      openCart();
    },
    null,
    0.29
  );

  waitForNextPaint().then(() => {
    if (cartBackdropTransfer?.timeline === timeline) timeline.play(0);
  });
}

function enqueueMutation(operation) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => {});
  return result;
}

function stopCartReveal(drawer = getDrawer()) {
  if (cartRevealTimeline) {
    cartRevealTimeline.kill();
    cartRevealTimeline = null;
  }

  const items = drawer?.querySelectorAll('[data-cart-line]') || [];
  if (items.length) {
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: 'opacity' });
  }
}

function playCartReveal(drawer, revealLineKeys, delay = 0) {
  stopCartReveal(drawer);

  const allItems = Array.from(drawer.querySelectorAll('[data-cart-line]'));
  const items = Array.isArray(revealLineKeys)
    ? allItems.filter((item) => revealLineKeys.includes(item.dataset.lineKey))
    : allItems;
  if (
    !items.length ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  gsap.set(items, { opacity: 0 });

  cartRevealTimeline = gsap.timeline({
    onComplete: () => {
      gsap.set(items, { clearProps: 'opacity' });
      cartRevealTimeline = null;
    },
  });
  cartRevealTimeline.to(
    items,
    {
      opacity: 1,
      duration: 0.25,
      ease: 'power1.out',
      stagger: 0.03,
    },
    delay
  );
}

function stopCartEmptyMorph() {
  cartEmptyMorph?.cancel();
}

function measureCartDialog(drawer) {
  const dialog = drawer.querySelector('[data-cart-dialog]');
  if (!dialog || !document.body) return null;

  const drawerStyle = drawer.getAttribute('style');
  const dialogStyle = dialog.getAttribute('style');

  drawer.style.visibility = 'hidden';
  drawer.style.pointerEvents = 'none';
  drawer.style.zIndex = '-1';
  dialog.style.opacity = '1';
  dialog.style.transition = 'none';
  document.body.append(drawer);

  const rect = dialog.getBoundingClientRect();
  drawer.remove();

  if (drawerStyle === null) {
    drawer.removeAttribute('style');
  } else {
    drawer.setAttribute('style', drawerStyle);
  }
  if (dialogStyle === null) {
    dialog.removeAttribute('style');
  } else {
    dialog.setAttribute('style', dialogStyle);
  }

  return rect;
}

function playCartEmptyMorph(currentDrawer, nextDrawer) {
  stopCartEmptyMorph();

  if (
    document.hidden ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return Promise.resolve();
  }

  const currentDialog = currentDrawer.querySelector('[data-cart-dialog]');
  const nextDialog = nextDrawer.querySelector('[data-cart-dialog]');
  const emptyState = nextDrawer.querySelector('.v3-cart__empty');
  const currentRect = currentDialog?.getBoundingClientRect();
  const targetRect = measureCartDialog(nextDrawer);

  if (
    !currentDialog ||
    !nextDialog ||
    !emptyState ||
    !currentRect?.width ||
    !currentRect?.height ||
    !targetRect?.width ||
    !targetRect?.height
  ) {
    return Promise.resolve();
  }

  const header = currentDrawer.querySelector('.v3-cart__header');
  const count = currentDrawer.querySelector('[data-cart-count]');
  const outgoing = [
    currentDrawer.querySelector('.v3-cart__scroll'),
    currentDrawer.querySelector('.v3-cart__footer'),
  ].filter(Boolean);
  const incoming = emptyState.cloneNode(true);

  incoming.setAttribute('aria-hidden', 'true');
  incoming.inert = true;
  currentDialog.append(incoming);
  currentDrawer.setAttribute('data-cart-morph', 'empty');

  gsap.set(currentDialog, {
    width: currentRect.width,
    height: currentRect.height,
    willChange: 'width, height',
  });
  gsap.set(outgoing, { transition: 'none' });
  if (count) {
    gsap.set(count, {
      transition: 'none',
      transformOrigin: 'center',
    });
  }
  gsap.set(incoming, {
    position: 'absolute',
    top: header?.getBoundingClientRect().height || 0,
    right: 0,
    left: 0,
    autoAlpha: 0,
    transition: 'none',
  });

  return new Promise((resolve) => {
    let settled = false;
    let timeline;

    const finish = () => {
      if (settled) return;
      settled = true;

      currentDrawer.removeAttribute('data-cart-morph');
      gsap.set(currentDialog, {
        clearProps: 'width,height,willChange',
      });
      gsap.set(outgoing, {
        clearProps: 'opacity,transition',
      });
      if (count) {
        gsap.set(count, {
          clearProps: 'opacity,visibility,transform,transformOrigin,transition',
        });
      }
      incoming.remove();

      if (cartEmptyMorph?.timeline === timeline) cartEmptyMorph = null;
      resolve();
    };

    timeline = gsap.timeline({
      defaults: { ease: 'power1.out' },
      onComplete: finish,
    });
    cartEmptyMorph = {
      timeline,
      cancel() {
        timeline.kill();
        finish();
      },
    };

    timeline.to(outgoing, { opacity: 0, duration: 0.14 }, 0);
    if (count) {
      timeline.to(
        count,
        {
          autoAlpha: 0,
          scale: 0.85,
          duration: 0.14,
        },
        0
      );
    }
    timeline.to(
      currentDialog,
      {
        width: targetRect.width,
        height: targetRect.height,
        duration: 0.32,
        ease: 'power1.inOut',
      },
      0.04
    );
    timeline.to(incoming, { autoAlpha: 1, duration: 0.17 }, 0.23);
  });
}

function getCartTriggers() {
  return Array.from(document.querySelectorAll(CART_TRIGGER_SELECTOR));
}

function isFocusable(element, { excludeDrawer = false } = {}) {
  if (!(element instanceof HTMLElement) || !element.isConnected) return false;
  if (excludeDrawer && getDrawer()?.contains(element)) return false;
  if (
    element.hidden ||
    element.matches(':disabled') ||
    element.closest('[aria-hidden="true"], [inert]')
  ) {
    return false;
  }

  const styles = window.getComputedStyle(element);
  if (styles.display === 'none' || styles.visibility === 'hidden') return false;
  if (!element.getClientRects().length) return false;
  return element.tabIndex >= 0;
}

function getExternalFocusFallback() {
  return (
    getCartTriggers().find((trigger) =>
      isFocusable(trigger, { excludeDrawer: true })
    ) ||
    Array.from(
      document.querySelectorAll(
        'header a[href], main a[href], main button:not([disabled])'
      )
    ).find((element) => isFocusable(element, { excludeDrawer: true })) ||
    null
  );
}

function getReturnFocusTarget(trigger) {
  if (!(trigger instanceof HTMLElement)) return getExternalFocusFallback();

  if (trigger.closest('[data-mobile-menu]')) {
    const mobileTrigger = document.querySelector('[data-nav-cart-mobile]');
    return isFocusable(mobileTrigger, { excludeDrawer: true })
      ? mobileTrigger
      : getExternalFocusFallback();
  }

  if (trigger.closest('[data-submenu]')) {
    const desktopTrigger = document.querySelector('[data-nav-cart]');
    return isFocusable(desktopTrigger, { excludeDrawer: true })
      ? desktopTrigger
      : getExternalFocusFallback();
  }

  return isFocusable(trigger, { excludeDrawer: true })
    ? trigger
    : getExternalFocusFallback();
}

function resolveAddSubmitter(form, submitter) {
  if (
    submitter instanceof HTMLButtonElement &&
    submitter.form === form &&
    submitter.isConnected
  ) {
    return submitter;
  }

  return (
    Array.from(
      form.querySelectorAll(
        'button[type="submit"]:not([disabled]), button:not([type]):not([disabled])'
      )
    ).find((button) => button instanceof HTMLButtonElement) || null
  );
}

function getAddReturnTarget(form, submitter) {
  const activeElement = document.activeElement;
  const candidates = [
    submitter,
    form.contains(activeElement) ? activeElement : null,
    resolveAddSubmitter(form, submitter),
  ];

  return (
    candidates.find((candidate) =>
      isFocusable(candidate, { excludeDrawer: true })
    ) || getExternalFocusFallback()
  );
}

function syncTriggerExpansion(isOpen) {
  getCartTriggers().forEach((trigger) => {
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
}

function updateWrittenNavigationCount(count, displayCount, itemCount) {
  const trigger = count.closest('[data-nav-cart]');
  const willShow = itemCount > 0;
  const wasShowing = !count.hidden;
  const activeTimeline = trigger ? navigationCountTimelines.get(trigger) : null;

  if (activeTimeline) {
    activeTimeline.kill();
    navigationCountTimelines.delete(trigger);
  }
  if (trigger) {
    gsap.set(trigger, {
      clearProps: 'width,overflow,willChange',
    });
  }
  gsap.set(count, { clearProps: 'opacity,visibility' });
  count.textContent = `\u00A0(${displayCount})`;

  if (
    !trigger ||
    wasShowing === willShow ||
    document.hidden ||
    !trigger.getClientRects().length ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    count.hidden = !willShow;
    return;
  }

  const startWidth = trigger.getBoundingClientRect().width;
  let targetWidth;

  if (willShow) {
    count.hidden = false;
    targetWidth = trigger.getBoundingClientRect().width;
    gsap.set(count, { autoAlpha: 0 });
  } else {
    count.hidden = true;
    targetWidth = trigger.getBoundingClientRect().width;
    count.hidden = false;
  }

  if (!startWidth || !targetWidth) {
    count.hidden = !willShow;
    gsap.set(count, { clearProps: 'opacity,visibility' });
    return;
  }

  gsap.set(trigger, {
    width: startWidth,
    overflow: 'hidden',
    willChange: 'width',
  });

  let timeline;
  const finish = () => {
    count.hidden = !willShow;
    gsap.set(trigger, {
      clearProps: 'width,overflow,willChange',
    });
    gsap.set(count, { clearProps: 'opacity,visibility' });
    if (navigationCountTimelines.get(trigger) === timeline) {
      navigationCountTimelines.delete(trigger);
    }
  };

  timeline = gsap.timeline({ onComplete: finish });
  navigationCountTimelines.set(trigger, timeline);

  if (willShow) {
    timeline.to(
      trigger,
      {
        width: targetWidth,
        duration: 0.24,
        ease: 'power1.inOut',
      },
      0
    );
    timeline.to(
      count,
      {
        autoAlpha: 1,
        duration: 0.16,
        ease: 'power1.out',
      },
      0.08
    );
    return;
  }

  timeline.to(
    count,
    {
      autoAlpha: 0,
      duration: 0.12,
      ease: 'power1.out',
    },
    0
  );
  timeline.to(
    trigger,
    {
      width: targetWidth,
      duration: 0.24,
      ease: 'power1.inOut',
    },
    0.04
  );
}

function updateMobileNavigationBadge(badge, itemCount) {
  const content = badge.querySelector('[data-nav-cart-badge-content]') || badge;
  const displayCount = itemCount > 9 ? '9+' : String(itemCount);
  const willShow = itemCount > 0;
  const wasShowing = !badge.hidden;
  const activeTimeline = navigationBadgeTimelines.get(badge);

  if (activeTimeline) {
    activeTimeline.kill();
    navigationBadgeTimelines.delete(badge);
  }
  gsap.set(content, {
    clearProps: 'opacity,visibility,transform,transformOrigin,willChange',
  });
  content.textContent = displayCount;

  if (
    wasShowing === willShow ||
    document.hidden ||
    !badge.parentElement?.getClientRects().length ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    badge.hidden = !willShow;
    return;
  }

  badge.hidden = false;
  gsap.set(content, {
    transformOrigin: 'center',
    willChange: 'transform, opacity',
  });

  let timeline;
  const finish = () => {
    badge.hidden = !willShow;
    gsap.set(content, {
      clearProps: 'opacity,visibility,transform,transformOrigin,willChange',
    });
    if (navigationBadgeTimelines.get(badge) === timeline) {
      navigationBadgeTimelines.delete(badge);
    }
  };

  timeline = gsap.timeline({ onComplete: finish });
  navigationBadgeTimelines.set(badge, timeline);

  if (willShow) {
    gsap.set(content, { autoAlpha: 0, scale: 0.86 });
    timeline.to(content, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.2,
      ease: 'power1.out',
    });
    return;
  }

  timeline.to(content, {
    autoAlpha: 0,
    scale: 0.9,
    duration: 0.14,
    ease: 'power1.out',
  });
}

function updateNavigationCount(itemCount) {
  const displayCount = itemCount > 99 ? '99+' : String(itemCount);
  const bagLabel = getBagLabel();
  const cartCopy = getCartCopy();

  document.querySelectorAll('[data-nav-cart-count]').forEach((count) => {
    updateWrittenNavigationCount(count, displayCount, itemCount);
  });

  document.querySelectorAll('[data-nav-cart-badge]').forEach((badge) => {
    updateMobileNavigationBadge(badge, itemCount);
  });

  document.querySelectorAll('[data-cart-quick-label]').forEach((label) => {
    label.textContent =
      itemCount > 0 ? `${bagLabel} (${displayCount})` : bagLabel;
  });

  document.querySelectorAll('[data-nav-cart-label]').forEach((label) => {
    label.textContent = bagLabel;
  });

  getCartTriggers().forEach((trigger) => {
    const label =
      itemCount > 0
        ? `${bagLabel}, ${itemCount} ${
            itemCount === 1 ? cartCopy.item : cartCopy.items
          }`
        : bagLabel;
    trigger.setAttribute('aria-label', label);
  });
}

function announce(message) {
  const status = getDrawer()?.querySelector('[data-cart-status]');
  if (!status) return;

  status.textContent = '';
  window.requestAnimationFrame(() => {
    status.textContent = message;
  });
}

function showError(message) {
  const error = getDrawer()?.querySelector('[data-cart-error]');
  if (!error) return;

  error.textContent = message;
  error.hidden = false;
}

function clearError() {
  const error = getDrawer()?.querySelector('[data-cart-error]');
  if (!error) return;

  error.textContent = '';
  error.hidden = true;
}

function clearAddError(form) {
  document.querySelector(FALLBACK_ADD_ERROR_SELECTOR)?.remove();
  if (!form.isConnected) return;

  const productForm = form.closest('product-form');
  const errorWrapper = productForm?.querySelector(
    '.product-form__error-message-wrapper'
  );
  const errorMessage = errorWrapper?.querySelector(
    '.product-form__error-message'
  );

  if (errorMessage) errorMessage.textContent = '';
  if (errorWrapper) errorWrapper.hidden = true;
  form.querySelector('[data-cart-submit-error]')?.remove();
}

function showAddError(form, message) {
  if (form.isConnected) {
    const productForm = form.closest('product-form');
    const errorWrapper = productForm?.querySelector(
      '.product-form__error-message-wrapper'
    );
    const errorMessage = errorWrapper?.querySelector(
      '.product-form__error-message'
    );

    if (errorWrapper && errorMessage) {
      errorMessage.textContent = message;
      errorWrapper.hidden = false;
      return;
    }

    let error = form.querySelector('[data-cart-submit-error]');
    if (!error) {
      error = document.createElement('p');
      error.className = 'cart-submit-error';
      error.dataset.cartSubmitError = '';
      error.setAttribute('role', 'alert');
      form.append(error);
    }
    error.textContent = message;
    return;
  }

  if (getDrawer()?.dataset.cartState === 'open') {
    showError(message);
    announce(message);
    return;
  }

  document.querySelector(FALLBACK_ADD_ERROR_SELECTOR)?.remove();
  const error = document.createElement('p');
  error.className = 'cart-submit-error cart-submit-error--global';
  error.dataset.cartGlobalError = '';
  error.setAttribute('role', 'alert');
  error.textContent = message;
  const visibleHost =
    document.querySelector(
      '[data-search-drawer][data-search-state="open"] [role="dialog"]'
    ) ||
    document.querySelector(
      '[data-mobile-menu][data-mobile-menu-state="open"] [role="dialog"]'
    ) ||
    document.querySelector(
      '[data-submenu][data-submenu-state="open"] [role="dialog"]'
    ) ||
    document.querySelector('main') ||
    document.querySelector('[role="main"]');
  (visibleHost || document.body).prepend(error);
}

function beginSubmitFeedback(submitter) {
  if (!(submitter instanceof HTMLButtonElement)) return null;

  const existingRecord = submitFeedbackRecords.get(submitter);
  if (existingRecord) {
    existingRecord.pending += 1;
    return { submitter, record: existingRecord, ended: false };
  }

  const status = document.createElement('span');
  status.className = 'cart-submit-status';
  status.dataset.cartSubmitStatus = '';
  status.setAttribute('aria-hidden', 'true');
  status.textContent = getCartCopy().adding;

  const directTextNodes = Array.from(submitter.childNodes).filter(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );
  directTextNodes.forEach((node) => {
    const content = document.createElement('span');
    content.dataset.cartSubmitContent = '';
    node.replaceWith(content);
    content.append(node);
  });

  const record = {
    status,
    wasDisabled: submitter.disabled,
    ariaBusy: submitter.getAttribute('aria-busy'),
    ariaLabel: submitter.getAttribute('aria-label'),
    ariaLabelledby: submitter.getAttribute('aria-labelledby'),
    timer: null,
    pending: 1,
  };

  submitter.append(status);
  submitter.disabled = true;
  submitter.setAttribute('aria-busy', 'true');
  submitter.setAttribute('aria-label', getCartCopy().addingAria);
  submitter.removeAttribute('aria-labelledby');
  submitter.dataset.cartSubmitState = 'loading';

  record.timer = window.setTimeout(() => {
    if (submitter.isConnected) {
      submitter.dataset.cartSubmitProgress = 'visible';
    }
  }, ADD_FEEDBACK_DELAY);

  submitFeedbackRecords.set(submitter, record);
  return { submitter, record, ended: false };
}

function endSubmitFeedback(feedback) {
  if (!feedback || feedback.ended) return;
  feedback.ended = true;

  const { submitter, record } = feedback;
  record.pending -= 1;
  if (record.pending > 0) return;

  window.clearTimeout(record.timer);
  record.status.remove();
  submitter.disabled = record.wasDisabled;
  delete submitter.dataset.cartSubmitState;
  delete submitter.dataset.cartSubmitProgress;

  if (record.ariaBusy === null) {
    submitter.removeAttribute('aria-busy');
  } else {
    submitter.setAttribute('aria-busy', record.ariaBusy);
  }

  if (record.ariaLabel === null) {
    submitter.removeAttribute('aria-label');
  } else {
    submitter.setAttribute('aria-label', record.ariaLabel);
  }

  if (record.ariaLabelledby === null) {
    submitter.removeAttribute('aria-labelledby');
  } else {
    submitter.setAttribute('aria-labelledby', record.ariaLabelledby);
  }

  submitter
    .querySelectorAll('[data-cart-submit-content]')
    .forEach((content) => {
      content.replaceWith(...content.childNodes);
    });
  submitFeedbackRecords.delete(submitter);
}

function syncDrawerBusy(drawer = getDrawer()) {
  if (!drawer) return;
  const isBusy = drawerBusyOperations.size > 0;

  const dialog = drawer.querySelector('[data-cart-dialog]');
  dialog?.setAttribute('aria-busy', String(isBusy));

  drawer.querySelectorAll('[data-cart-line-progress]').forEach((line) => {
    line.removeAttribute('data-cart-line-progress');
  });
  drawerBusyOperations.forEach((operation) => {
    if (!operation.progressVisible || !operation.lineKey) return;
    const line = drawer.querySelector(
      `[data-line-key="${CSS.escape(operation.lineKey)}"]`
    );
    line?.setAttribute('data-cart-line-progress', operation.type);
  });

  const controls = drawer.querySelectorAll(
    '[data-cart-quantity-change], [data-cart-remove], [name="checkout"]'
  );

  controls.forEach((control) => {
    if (control instanceof HTMLButtonElement) {
      control.disabled = isBusy;
    } else {
      control.toggleAttribute('aria-disabled', isBusy);
    }
  });
}

function beginDrawerBusy(lineKey, type) {
  const operation = {
    lineKey,
    type,
    progressVisible: false,
    timer: null,
  };
  operation.timer = window.setTimeout(() => {
    operation.progressVisible = true;
    syncDrawerBusy();
  }, DRAWER_FEEDBACK_DELAY);
  drawerBusyOperations.add(operation);
  syncDrawerBusy();
  return operation;
}

function endDrawerBusy(operation) {
  window.clearTimeout(operation.timer);
  drawerBusyOperations.delete(operation);
  syncDrawerBusy();
}

function parseSection(html) {
  if (typeof html !== 'string' || !html.trim()) return null;

  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  return documentFragment.querySelector(DRAWER_SELECTOR);
}

function getReplacementFocusSelector(drawer, preferredSelector) {
  if (preferredSelector) return preferredSelector;

  const activeElement = document.activeElement;
  if (
    !(activeElement instanceof HTMLElement) ||
    !drawer.contains(activeElement)
  ) {
    return '[data-cart-close]';
  }
  if (activeElement.matches('[data-cart-close]')) return '[data-cart-close]';
  if (activeElement.matches('[name="checkout"]')) return '[name="checkout"]';
  if (activeElement.matches('.v3-cart__start-shopping')) {
    return '.v3-cart__start-shopping';
  }

  const line = activeElement.closest('[data-cart-line]');
  const lineKey = line?.dataset.lineKey;
  if (lineKey) {
    const lineSelector = `[data-line-key="${CSS.escape(lineKey)}"]`;
    const action = activeElement.dataset.cartAction;
    if (action) {
      return `${lineSelector} [data-cart-action="${CSS.escape(action)}"]`;
    }
    if (activeElement.matches('[data-cart-remove]')) {
      return `${lineSelector} [data-cart-remove]`;
    }
    const href = activeElement.getAttribute('href');
    if (href) return `${lineSelector} [href="${CSS.escape(href)}"]`;
  }

  return '[data-cart-close]';
}

function focusReplacement(drawer, selector) {
  const target =
    drawer.querySelector(selector) || drawer.querySelector('[data-cart-close]');
  if (isFocusable(target)) {
    target.focus({ preventScroll: true });
  }

  window.requestAnimationFrame(() => {
    if (
      drawer.dataset.cartState === 'open' &&
      !drawer.contains(document.activeElement) &&
      isFocusable(target)
    ) {
      target.focus({ preventScroll: true });
    }
  });
}

async function applyRenderedSection(
  html,
  { focusTarget = null, revealLineKeys = [] } = {}
) {
  const currentDrawer = getDrawer();
  const nextDrawer = parseSection(html);
  if (!currentDrawer || !nextDrawer) return false;

  const wasOpen = currentDrawer.dataset.cartState === 'open';
  const replacementFocus = wasOpen
    ? getReplacementFocusSelector(currentDrawer, focusTarget)
    : null;
  const nextCount = Number(
    nextDrawer.querySelector('[data-cart-count]')?.textContent.trim() || 0
  );
  const shouldMorphToEmpty =
    wasOpen &&
    currentDrawer.dataset.cartEmpty === 'false' &&
    nextDrawer.dataset.cartEmpty === 'true';

  if (wasOpen) {
    nextDrawer.dataset.cartState = 'open';
    stopCartReveal(currentDrawer);
  }

  if (shouldMorphToEmpty) {
    updateNavigationCount(nextCount);
    focusReplacement(currentDrawer, replacementFocus);
    await playCartEmptyMorph(currentDrawer, nextDrawer);
    nextDrawer.dataset.cartState = currentDrawer.dataset.cartState;
    nextDrawer.setAttribute(
      'aria-hidden',
      currentDrawer.getAttribute('aria-hidden') || 'true'
    );
  } else if (wasOpen) {
    nextDrawer.setAttribute('aria-hidden', 'false');
  }

  currentDrawer.replaceWith(nextDrawer);
  if (!shouldMorphToEmpty) updateNavigationCount(nextCount);
  syncDrawerBusy(nextDrawer);

  if (nextDrawer.dataset.cartState === 'open') {
    modalCoordinator.refresh(MODAL_OWNER, nextDrawer);
    focusReplacement(nextDrawer, replacementFocus);
    playCartReveal(nextDrawer, revealLineKeys);
  }

  return true;
}

function getRenderedSection(response) {
  const sectionId = getSectionId();
  return sectionId ? response.sections?.[sectionId] : null;
}

async function requestRenderedSection() {
  const sectionId = getSectionId();
  if (!sectionId) return null;

  const url = new URL(window.location.href);
  url.searchParams.set('section_id', sectionId);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return response.ok ? response.text() : null;
  } catch {
    return null;
  }
}

async function renderCartResponse(response, options = {}) {
  if (await applyRenderedSection(getRenderedSection(response), options)) {
    return true;
  }

  const fallbackSection = await requestRenderedSection();
  return await applyRenderedSection(fallbackSection, options);
}

function getCustomerErrorMessage(data, fallbackMessage) {
  const candidate =
    typeof data?.description === 'string'
      ? data.description
      : typeof data?.message === 'string'
        ? data.message
        : '';
  const message = candidate
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    !message ||
    /unexpected token|json|parse error|syntax error/i.test(message)
  ) {
    return fallbackMessage;
  }
  return message;
}

async function parseCartResponse(response, fallbackMessage) {
  let text = '';
  try {
    text = await response.text();
  } catch {
    throw new Error(fallbackMessage);
  }

  let data = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok || data?.status) {
    throw new Error(getCustomerErrorMessage(data, fallbackMessage));
  }
  if (!data || typeof data !== 'object') throw new Error(fallbackMessage);
  return data;
}

async function requestCartChange(lineKey, quantity) {
  const sectionId = getSectionId();
  try {
    const response = await fetch(getCartEndpoint('change'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        id: lineKey,
        quantity,
        sections: sectionId ? [sectionId] : [],
        sections_url: `${window.location.pathname}${window.location.search}`,
      }),
    });
    return parseCartResponse(response, getCartCopy().updateError);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(getCartCopy().updateConnectionError);
    }
    throw error;
  }
}

async function requestAddToCart(formData) {
  try {
    const response = await fetch(getCartEndpoint('add'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
    });
    return parseCartResponse(response, getCartCopy().addError);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(getCartCopy().addConnectionError);
    }
    throw error;
  }
}

function dispatchCartUpdated(response, source, message) {
  const itemCount = Number(
    getDrawer()?.querySelector('[data-cart-count]')?.textContent.trim() || 0
  );

  document.dispatchEvent(
    new CustomEvent('cart:updated', {
      detail: {
        cart: response,
        itemCount,
        source,
        message,
      },
    })
  );
}

function getAddedLineKeys(response) {
  const addedItems = Array.isArray(response?.items)
    ? response.items
    : [response];

  return addedItems
    .map((item) => item?.key)
    .filter((key) => typeof key === 'string' && key);
}

function waitForNextPaint() {
  if (document.hidden) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const fallbackTimer = window.setTimeout(finish, 100);

    window.requestAnimationFrame(() => {
      if (document.hidden) {
        finish();
        return;
      }
      window.requestAnimationFrame(finish);
    });
  });
}

function waitForClosedDrawerFrame() {
  const drawer = getDrawer();
  if (
    !drawer ||
    drawer.dataset.cartState !== 'closed' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return Promise.resolve();
  }

  return waitForNextPaint();
}

export function openCartDrawer(trigger = null, { revealLineKeys = null } = {}) {
  const drawer = getDrawer();
  if (
    !drawer ||
    drawer.dataset.cartState === 'open' ||
    drawer.dataset.cartState === 'opening' ||
    cartBackdropTransfer
  ) {
    return;
  }

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  const mobileMenuContext = getMobileMenuCartContext(trigger);
  if (mobileMenuContext) {
    transferMobileMenuToCart(
      trigger,
      drawer,
      mobileMenuContext,
      revealLineKeys
    );
    return;
  }

  closeCompetingDrawers();
  openTrigger = getReturnFocusTarget(trigger || document.activeElement);
  const stageFirstPaint =
    !document.hidden &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  drawer.dataset.cartState = stageFirstPaint ? 'opening' : 'open';
  drawer.setAttribute('aria-hidden', 'false');
  syncTriggerExpansion(true);
  modalCoordinator.acquire(MODAL_OWNER, drawer, { useBackdrop: true });
  syncDrawerBusy(drawer);

  const completeOpen = () => {
    if (
      getDrawer() !== drawer ||
      (drawer.dataset.cartState !== 'opening' &&
        drawer.dataset.cartState !== 'open')
    ) {
      return;
    }

    drawer.dataset.cartState = 'open';
    playCartReveal(drawer, revealLineKeys, 0.3);
    focusReplacement(drawer, '[data-cart-close]');
  };

  if (stageFirstPaint) {
    waitForNextPaint().then(completeOpen);
  } else {
    completeOpen();
  }
}

export function closeCartDrawer({ restoreFocus = true } = {}) {
  const drawer = getDrawer();
  if (!drawer || !['open', 'opening'].includes(drawer.dataset.cartState)) {
    return;
  }

  clearCartBackdropTransfer();
  stopCartReveal(drawer);
  drawer.dataset.cartState = 'closing';
  syncTriggerExpansion(false);
  modalCoordinator.release(MODAL_OWNER);

  const returnTarget =
    restoreFocus && isFocusable(openTrigger, { excludeDrawer: true })
      ? openTrigger
      : getExternalFocusFallback();
  if (returnTarget) {
    returnTarget.focus({ preventScroll: true });
  }
  drawer.setAttribute('aria-hidden', 'true');

  closeTimer = window.setTimeout(() => {
    const currentDrawer = getDrawer();
    if (currentDrawer) currentDrawer.dataset.cartState = 'closed';
    closeTimer = null;
    openTrigger = null;
  }, 280);
}

export async function changeCartLine(
  lineKey,
  quantity,
  { focusAction = '', source = 'drawer' } = {}
) {
  clearError();
  const busyOperation = beginDrawerBusy(
    lineKey,
    quantity > 0 ? 'quantity' : 'remove'
  );
  let completedFocusTarget = null;

  return enqueueMutation(async () => {
    try {
      const response = await requestCartChange(lineKey, quantity);

      const focusTarget =
        source !== 'drawer'
          ? null
          : quantity > 0 && focusAction
            ? `[data-line-key="${CSS.escape(
                lineKey
              )}"] [data-cart-action="${CSS.escape(focusAction)}"]`
            : quantity > 0
              ? `[data-line-key="${CSS.escape(lineKey)}"] [data-cart-remove]`
              : '[data-cart-close]';

      const message =
        quantity > 0
          ? formatCartCopy('quantityUpdated', { quantity })
          : getCartCopy().removed;
      const rendered = await renderCartResponse(response, {
        focusTarget,
        revealLineKeys: quantity > 0 ? [lineKey] : [],
      });
      if (!rendered) {
        dispatchCartUpdated(response, source, message);
        throw new Error(getCartCopy().refreshUpdatedError);
      }

      completedFocusTarget = focusTarget;
      announce(message);
      dispatchCartUpdated(response, source, message);
      return response;
    } catch (error) {
      showError(error.message);
      announce(error.message);
      throw error;
    } finally {
      endDrawerBusy(busyOperation);
      const drawer = getDrawer();
      if (completedFocusTarget && drawer?.dataset.cartState === 'open') {
        focusReplacement(drawer, completedFocusTarget);
      }
    }
  });
}

function createAddFormData(form, submitter) {
  let formData;
  try {
    formData = submitter ? new FormData(form, submitter) : new FormData(form);
  } catch {
    formData = new FormData(form);
  }

  const variantId = formData.get('id');
  if (!formData.has('quantity') && variantId) {
    const legacyQuantity = formData.get(`quantity-${variantId}`);
    if (legacyQuantity !== null) formData.set('quantity', legacyQuantity);
  }

  const sectionId = getSectionId();
  if (sectionId) formData.set('sections', sectionId);
  formData.set(
    'sections_url',
    `${window.location.pathname}${window.location.search}`
  );
  return formData;
}

function addProductForm(form, submitter) {
  const feedbackSubmitter = resolveAddSubmitter(form, submitter);
  const returnTarget = getAddReturnTarget(form, submitter);
  const formData = createAddFormData(form, submitter);
  const feedback = beginSubmitFeedback(feedbackSubmitter);
  clearError();
  clearAddError(form);

  return enqueueMutation(async () => {
    try {
      const response = await requestAddToCart(formData);
      const message = getCartCopy().added;
      const revealLineKeys = getAddedLineKeys(response);
      const rendered = await renderCartResponse(response, { revealLineKeys });
      if (!rendered) {
        dispatchCartUpdated(response, 'add', message);
        throw new Error(getCartCopy().refreshAddedError);
      }

      dispatchCartUpdated(response, 'add', message);
      await waitForClosedDrawerFrame();
      endSubmitFeedback(feedback);
      openCartDrawer(returnTarget, { revealLineKeys });
      announce(message);
    } catch (error) {
      showAddError(form, error.message);
    } finally {
      endSubmitFeedback(feedback);
    }
  });
}

function isAddToCartForm(form) {
  if (!(form instanceof HTMLFormElement)) return false;

  try {
    const action = new URL(form.action, window.location.origin);
    return /\/cart\/add(?:\.js)?$/.test(action.pathname);
  } catch {
    return false;
  }
}

function handleSubmit(event) {
  const form = event.target;

  if (form.matches?.('[data-cart-change-form]')) {
    event.preventDefault();
    const submitter = event.submitter;
    const lineKey = new FormData(form).get('id');
    const quantity = Number(submitter?.value);
    const focusAction = submitter?.dataset.cartAction || '';

    if (!lineKey || !Number.isFinite(quantity)) return;
    changeCartLine(lineKey, quantity, { focusAction }).catch(() => {});
    return;
  }

  if (!isAddToCartForm(form)) return;
  event.preventDefault();
  addProductForm(form, event.submitter).catch(() => {});
}

function handleClick(event) {
  const cartTrigger = event.target.closest(CART_TRIGGER_SELECTOR);
  if (cartTrigger) {
    event.preventDefault();
    openCartDrawer(cartTrigger);
    return;
  }

  if (event.target.closest('[data-cart-close], [data-cart-overlay]')) {
    closeCartDrawer();
    return;
  }

  const remove = event.target.closest('[data-cart-remove]');
  if (!remove) return;

  event.preventDefault();
  if (remove.getAttribute('aria-disabled') === 'true') return;

  const line = remove.closest('[data-cart-line]');
  const lineKey = line?.dataset.lineKey;
  if (!lineKey) return;

  changeCartLine(lineKey, 0).catch(() => {});
}

function handleKeydown(event) {
  const drawer = getDrawer();
  if (!drawer || drawer.dataset.cartState !== 'open') return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeCartDrawer();
    return;
  }

  if (event.key !== 'Tab') return;

  const dialog = drawer.querySelector('[data-cart-dialog]');
  const focusables = Array.from(
    dialog?.querySelectorAll(FOCUSABLE_SELECTOR) || []
  ).filter((element) => isFocusable(element));
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function handleModalReleaseRequest(event) {
  if (
    event.detail?.owner === MODAL_OWNER &&
    event.detail?.nextOwner !== MODAL_OWNER
  ) {
    closeCartDrawer({ restoreFocus: false });
  }
}

function resetOnPageLifecycle() {
  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  const drawer = getDrawer();
  if (drawer) {
    clearCartBackdropTransfer();
    stopCartReveal(drawer);
    stopCartEmptyMorph();
    drawer.dataset.cartState = 'closed';
    drawer.setAttribute('aria-hidden', 'true');
  }
  drawerBusyOperations.forEach((operation) => {
    window.clearTimeout(operation.timer);
  });
  drawerBusyOperations.clear();
  syncDrawerBusy(drawer);
  syncTriggerExpansion(false);
  modalCoordinator.release(MODAL_OWNER);
  openTrigger = null;
}

const CartController = () => {
  if (!getDrawer()) return;

  const initialCount = Number(
    getDrawer()?.querySelector('[data-cart-count]')?.textContent.trim() || 0
  );
  updateNavigationCount(initialCount);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener(
    'v3:modal-release-request',
    handleModalReleaseRequest
  );
  window.addEventListener('pagehide', resetOnPageLifecycle);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resetOnPageLifecycle();
  });
};

export default CartController;
