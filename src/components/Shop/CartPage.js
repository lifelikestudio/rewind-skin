import { changeCartLine } from '../Cart/CartController';

let refreshId = 0;
let pendingFocus = null;
let pendingAnnouncement = '';

function getCartPage() {
  return document.querySelector('.cart-page');
}

function setPageBusy(isBusy) {
  const page = getCartPage();
  if (!page) return;

  page.setAttribute('aria-busy', String(isBusy));
  page
    .querySelectorAll(
      '.cart__quantity button, .item__remove, [name="checkout"]'
    )
    .forEach((control) => {
      if (control instanceof HTMLButtonElement) {
        control.disabled = isBusy;
      } else {
        control.toggleAttribute('aria-disabled', isBusy);
      }
    });
}

function announce(message, isError = false) {
  const page = getCartPage();
  if (!page) return;

  const status = page.querySelector('[data-cart-page-status]');
  const error = page.querySelector('[data-cart-page-error]');
  if (isError) {
    if (status) status.textContent = '';
  } else if (error) {
    error.textContent = '';
    error.hidden = true;
  }

  const target = page.querySelector(
    isError ? '[data-cart-page-error]' : '[data-cart-page-status]'
  );
  if (!target) return;

  target.textContent = '';
  target.hidden = false;
  window.requestAnimationFrame(() => {
    target.textContent = message;
  });
}

function clearMessages() {
  const page = getCartPage();
  if (!page) return;

  const status = page.querySelector('[data-cart-page-status]');
  const error = page.querySelector('[data-cart-page-error]');
  if (status) status.textContent = '';
  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

async function refreshCartPage(message) {
  const currentPage = getCartPage();
  if (!currentPage) return;

  const requestId = ++refreshId;
  const response = await fetch(
    `${window.location.pathname}${window.location.search}`,
    {
      headers: {
        Accept: 'text/html',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );

  if (!response.ok) {
    throw new Error('We could not refresh your bag.');
  }

  const html = await response.text();
  if (requestId !== refreshId) return;

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const nextPage = parsed.querySelector('.cart-page');
  if (!nextPage) {
    throw new Error('We could not refresh your bag.');
  }

  currentPage.replaceWith(nextPage);
  setPageBusy(false);

  if (pendingFocus) {
    const target = nextPage.querySelector(pendingFocus);
    (target || nextPage.querySelector('h1') || nextPage).focus?.();
    pendingFocus = null;
  }

  announce(message);
}

function getLineContext(control) {
  const line = control.closest('[data-line-item-key]');
  const input = line?.querySelector('.cart__quantity-input');

  return {
    line,
    lineKey: line?.dataset.lineItemKey || '',
    input,
    quantity: Number(input?.value),
  };
}

async function updateLine(lineKey, quantity, message) {
  setPageBusy(true);
  clearMessages();
  pendingAnnouncement = message;

  try {
    await changeCartLine(lineKey, quantity, { source: 'cart-page' });
  } catch (error) {
    pendingAnnouncement = '';
    pendingFocus = null;
    setPageBusy(false);
    announce(error.message, true);
  }
}

function handleCartPageClick(event) {
  const page = getCartPage();
  if (!page || !page.contains(event.target)) return;

  const remove = event.target.closest('.item__remove');
  if (remove) {
    if (remove.getAttribute('aria-disabled') === 'true') return;
    event.preventDefault();

    const { line, lineKey } = getLineContext(remove);
    if (!lineKey) return;

    const nextLine = line.nextElementSibling || line.previousElementSibling;
    pendingFocus = nextLine
      ? `[data-line-item-key="${CSS.escape(
          nextLine.dataset.lineItemKey
        )}"] .item__remove`
      : 'h1';
    updateLine(lineKey, 0, 'Item removed from your bag.');
    return;
  }

  const quantityButton = event.target.closest('.cart__quantity button');
  if (!quantityButton || quantityButton.disabled) return;
  event.preventDefault();

  const { lineKey, input, quantity } = getLineContext(quantityButton);
  if (!lineKey || !input || !Number.isFinite(quantity)) return;

  const isIncrease = quantityButton.classList.contains('quantity__increment');
  const nextQuantity = isIncrease ? quantity + 1 : quantity - 1;
  pendingFocus =
    nextQuantity > 0
      ? `[data-line-item-key="${CSS.escape(lineKey)}"] .${
          isIncrease ? 'quantity__increment' : 'quantity__decrement'
        }`
      : 'h1';
  updateLine(
    lineKey,
    Math.max(0, nextQuantity),
    nextQuantity > 0
      ? `Quantity updated to ${nextQuantity}.`
      : 'Item removed from your bag.'
  );
}

const CartPage = () => {
  if (!getCartPage()) return;

  document.addEventListener('click', handleCartPageClick);
  document.addEventListener('cart:updated', (event) => {
    const message =
      pendingAnnouncement ||
      event.detail?.message ||
      'Your bag has been updated.';
    pendingAnnouncement = '';

    refreshCartPage(message).catch((error) => {
      pendingFocus = null;
      setPageBusy(false);
      announce(error.message, true);
    });
  });
};

export default CartPage;
