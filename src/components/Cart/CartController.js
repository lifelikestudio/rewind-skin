import { gsap } from 'gsap';

const DRAWER_SELECTOR = 'v3-cart-drawer[data-section-id]';
const NAV_TRIGGER_SELECTOR = '[data-nav-cart], [data-nav-cart-mobile]';
const CART_TRIGGER_SELECTOR = [
  NAV_TRIGGER_SELECTOR,
  '[data-submenu-bag]',
  '[data-mobile-menu-bag]',
].join(',');
const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let openTrigger = null;
let closeTimer = null;
let inertRecords = [];
let previousOverflow = '';
let mutationId = 0;
let cartRevealTimeline = null;

function getDrawer() {
  return document.querySelector(DRAWER_SELECTOR);
}

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

function isolateModal(activeRoot) {
  clearModalIsolation();

  let branch = activeRoot;
  let parent = branch?.parentElement;

  while (parent) {
    Array.from(parent.children).forEach((child) => {
      if (child === branch) return;

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

function clearModalIsolation() {
  inertRecords.forEach(({ element, wasInert }) => {
    if (wasInert) {
      element.inert = true;
      return;
    }

    element.inert = false;
    element.removeAttribute('inert');
  });
  inertRecords = [];
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
  drawer?.removeAttribute('data-cart-reveal');
}

function playCartReveal(drawer) {
  stopCartReveal(drawer);

  const items = Array.from(drawer.querySelectorAll('[data-cart-line]'));
  if (
    !items.length ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  drawer.setAttribute('data-cart-reveal', '');
  gsap.set(items, { opacity: 0 });

  cartRevealTimeline = gsap.timeline({
    onComplete: () => {
      gsap.set(items, { clearProps: 'opacity' });
      drawer.removeAttribute('data-cart-reveal');
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
    0.3
  );
}

function getCartTriggers() {
  return Array.from(document.querySelectorAll(NAV_TRIGGER_SELECTOR));
}

function getReturnFocusTarget(trigger) {
  if (!(trigger instanceof HTMLElement)) return trigger;

  if (trigger.closest('[data-mobile-menu]')) {
    return document.querySelector('[data-nav-cart-mobile]') || trigger;
  }

  if (trigger.closest('[data-submenu]')) {
    return document.querySelector('[data-nav-cart]') || trigger;
  }

  return trigger;
}

function syncTriggerExpansion(isOpen) {
  getCartTriggers().forEach((trigger) => {
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
}

function updateNavigationCount(itemCount) {
  const displayCount = itemCount > 99 ? '99+' : String(itemCount);

  document.querySelectorAll('[data-nav-cart-count]').forEach((count) => {
    count.textContent = `\u00A0(${displayCount})`;
    count.hidden = itemCount === 0;
  });

  document.querySelectorAll('[data-nav-cart-badge]').forEach((badge) => {
    badge.textContent = itemCount > 9 ? '9+' : String(itemCount);
    badge.hidden = itemCount === 0;
  });

  document.querySelectorAll('[data-cart-quick-label]').forEach((label) => {
    label.textContent = `Bag (${displayCount})`;
  });

  document.querySelectorAll(NAV_TRIGGER_SELECTOR).forEach((trigger) => {
    const label =
      itemCount > 0
        ? `Bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
        : 'Bag';
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

function setBusy(isBusy) {
  const drawer = getDrawer();
  if (!drawer) return;

  const dialog = drawer.querySelector('[data-cart-dialog]');
  dialog?.setAttribute('aria-busy', String(isBusy));

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

function parseSection(html) {
  if (!html) return null;

  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  return documentFragment.querySelector(DRAWER_SELECTOR);
}

function applyRenderedSection(html, focusTarget = null) {
  const currentDrawer = getDrawer();
  const nextDrawer = parseSection(html);
  if (!currentDrawer || !nextDrawer) return false;

  const wasOpen = currentDrawer.dataset.cartState === 'open';
  const nextCount = Number(
    nextDrawer.querySelector('[data-cart-count]')?.textContent.trim() || 0
  );

  if (wasOpen) {
    nextDrawer.dataset.cartState = 'open';
    nextDrawer.setAttribute('aria-hidden', 'false');
    stopCartReveal(currentDrawer);
  }

  currentDrawer.replaceWith(nextDrawer);
  updateNavigationCount(nextCount);

  if (wasOpen) {
    isolateModal(nextDrawer);
  }

  if (focusTarget) {
    window.requestAnimationFrame(() => {
      nextDrawer.querySelector(focusTarget)?.focus();
    });
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

  const response = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  return response.ok ? response.text() : null;
}

async function renderCartResponse(response, focusTarget = null) {
  if (applyRenderedSection(getRenderedSection(response), focusTarget)) {
    return true;
  }

  const fallbackSection = await requestRenderedSection();
  return applyRenderedSection(fallbackSection, focusTarget);
}

async function parseCartResponse(response) {
  const data = await response.json();

  if (!response.ok || data.status) {
    const message =
      data.description || data.message || 'We could not update your bag.';
    throw new Error(message);
  }

  return data;
}

async function requestCartChange(lineKey, quantity) {
  const sectionId = getSectionId();
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

  return parseCartResponse(response);
}

async function requestAddToCart(form) {
  const sectionId = getSectionId();
  const formData = new FormData(form);
  if (sectionId) formData.set('sections', sectionId);
  formData.set(
    'sections_url',
    `${window.location.pathname}${window.location.search}`
  );

  const response = await fetch(getCartEndpoint('add'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: formData,
  });

  return parseCartResponse(response);
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

export function openCartDrawer(trigger = null) {
  const drawer = getDrawer();
  if (!drawer || drawer.dataset.cartState === 'open') return;

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  closeCompetingDrawers();
  openTrigger = getReturnFocusTarget(trigger || document.activeElement);
  previousOverflow = document.documentElement.style.overflow;
  drawer.dataset.cartState = 'open';
  drawer.setAttribute('aria-hidden', 'false');
  syncTriggerExpansion(true);
  document.documentElement.style.overflow = 'hidden';
  isolateModal(drawer);
  playCartReveal(drawer);

  window.requestAnimationFrame(() => {
    drawer.querySelector('[data-cart-close]')?.focus();
  });
}

export function closeCartDrawer({ restoreFocus = true } = {}) {
  const drawer = getDrawer();
  if (!drawer || drawer.dataset.cartState !== 'open') return;

  stopCartReveal(drawer);
  drawer.dataset.cartState = 'closing';
  syncTriggerExpansion(false);
  document.documentElement.style.overflow = previousOverflow;
  clearModalIsolation();

  if (restoreFocus && openTrigger instanceof HTMLElement) {
    openTrigger.focus();
  } else if (drawer.contains(document.activeElement)) {
    document.activeElement.blur();
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
  const requestId = ++mutationId;
  clearError();
  setBusy(true);

  try {
    const response = await requestCartChange(lineKey, quantity);
    if (requestId !== mutationId) return response;

    const focusTarget =
      source !== 'drawer'
        ? null
        : quantity > 0 && focusAction
          ? `[data-line-key="${CSS.escape(
              lineKey
            )}"] [data-cart-action="${focusAction}"]`
          : quantity > 0
            ? `[data-line-key="${CSS.escape(lineKey)}"] [data-cart-remove]`
            : '[data-cart-close]';

    const message =
      quantity > 0
        ? `Quantity updated to ${quantity}.`
        : 'Item removed from your bag.';
    const rendered = await renderCartResponse(response, focusTarget);
    if (!rendered) {
      dispatchCartUpdated(response, source, message);
      throw new Error(
        'Your bag was updated, but it could not be refreshed. Reload the page to see the latest items.'
      );
    }

    announce(message);
    dispatchCartUpdated(response, source, message);
    return response;
  } catch (error) {
    showError(error.message);
    announce(error.message);
    throw error;
  } finally {
    if (requestId === mutationId) setBusy(false);
  }
}

async function addProductForm(form, submitter) {
  const requestId = ++mutationId;
  clearError();

  if (submitter instanceof HTMLButtonElement) {
    submitter.disabled = true;
    submitter.setAttribute('aria-busy', 'true');
  }

  try {
    const response = await requestAddToCart(form);
    if (requestId !== mutationId) return;

    const message = 'Item added to your bag.';
    const rendered = await renderCartResponse(response);
    if (!rendered) {
      dispatchCartUpdated(response, 'add', message);
      throw new Error(
        'The item was added, but your bag could not be refreshed. Reload the page to see the latest items.'
      );
    }

    dispatchCartUpdated(response, 'add', message);
    openCartDrawer(submitter || form);
    announce(message);
  } catch (error) {
    openCartDrawer(submitter || form);
    showError(error.message);
    announce(error.message);
  } finally {
    if (submitter instanceof HTMLButtonElement && submitter.isConnected) {
      submitter.disabled = false;
      submitter.removeAttribute('aria-busy');
    }
  }
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
  addProductForm(form, event.submitter);
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
  if (!remove || remove.getAttribute('aria-disabled') === 'true') return;

  event.preventDefault();
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
  ).filter((element) => !element.hasAttribute('hidden'));
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

function resetOnPageLifecycle() {
  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  const drawer = getDrawer();
  if (drawer) {
    stopCartReveal(drawer);
    drawer.dataset.cartState = 'closed';
    drawer.setAttribute('aria-hidden', 'true');
  }
  syncTriggerExpansion(false);
  document.documentElement.style.overflow = previousOverflow;
  clearModalIsolation();
  openTrigger = null;
}

const CartController = () => {
  if (!getDrawer()) return;

  document.addEventListener('submit', handleSubmit);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('pagehide', resetOnPageLifecycle);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resetOnPageLifecycle();
  });
};

export default CartController;
