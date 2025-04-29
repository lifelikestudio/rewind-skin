import { openDrawer, closeDrawer } from './DrawerHandlers';
import { drawerCart } from './Drawers.js';

// Import formatMoney function from CartPage.js
import { formatMoney, removeItemFromCart } from '../Shop/CartPage.js';

// Selectors
const addToCart = document.querySelectorAll('form[action="/cart/add"]');
const cartLinks = document.querySelectorAll('a[href="/cart"]');
const drawerCartEl = '#drawer-cart';
const cartItemCount = document.querySelectorAll('.cart-action__count');

// Functions
const updateCartLinks = () => {
  cartLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDrawer(drawerCart);
    });
  });
};

export function updateCartItemCount(count) {
  cartItemCount.forEach((el) => {
    el.textContent = `(${count})`;
  });
}

// Cache loading template for better performance
const LOADING_TEMPLATE = `
  <div class="fill-loader fill-loader--v1" role="alert">
    <p class="fill-loader__label">Content is loading...</p>
    <div aria-hidden="true">
      <div class="fill-loader__base"></div>
      <div class="fill-loader__fill"></div>
    </div>
  </div>
`;

function showLoadingInCart() {
  const cartItemsContainer = document.querySelector('.drawer__container--cart');
  cartItemsContainer.innerHTML = LOADING_TEMPLATE;
}

function removeItems() {
  // Use event delegation instead of attaching listeners to each button
  const drawerElement = document.querySelector(drawerCartEl);
  if (!drawerElement) return;

  // Remove any existing handler first to avoid duplicates
  drawerElement.removeEventListener('click', handleRemoveItem);
  drawerElement.addEventListener('click', handleRemoveItem);
}

// Separate handler function for remove item clicks
function handleRemoveItem(e) {
  // Only proceed if a remove button was clicked
  if (!e.target.matches('.item__remove')) return;

  e.preventDefault();
  const lineItemKey = e.target.dataset.lineItemKey;
  if (lineItemKey) {
    removeItemFromCart(lineItemKey);
  }
}

function updateCartPageQuantity(key, quantity) {
  // Find the corresponding item in the CartPage
  const cartPageItem = document.querySelector(
    `.drawer-cart__item--cart-page[data-line-item-key="${key}"]`
  );

  // Update its quantity value
  if (cartPageItem) {
    const quantityInput = cartPageItem.querySelector('.cart__quantity input');
    if (quantityInput) {
      quantityInput.value = quantity;

      // After updating quantity, also update subtotal
      updateCartPageSubtotal();
    }
  } else {
    // If we're on the cart page and the item isn't found, try to reload the cart
    if (document.querySelector('.cart-page')) {
      // If the updateCart function exists in the global scope
      if (typeof window.updateCart === 'function') {
        window.updateCart();
      }
    }
  }
}

// New function to update cart page subtotal
async function updateCartPageSubtotal() {
  // Only proceed if we're on the cart page
  if (!document.querySelector('.cart-page')) {
    return;
  }

  try {
    // Get fresh cart data for accurate subtotal
    const freshCartRes = await fetch('/cart.js');
    const freshCartData = await freshCartRes.json();

    // Format the total price with the correct currency
    const format = document
      .querySelector('[data-money-format]')
      ?.getAttribute('data-money-format');
    const currency = freshCartData.currency || 'USD';

    if (format && freshCartData.total_price !== undefined) {
      // Format the price
      let totalPrice = formatMoney(freshCartData.total_price, format);

      // Ensure currency is included
      if (!totalPrice.includes(currency)) {
        totalPrice = `${totalPrice} ${currency}`;
      }

      // Update the subtotal in the cart page
      const totalPriceElement = document.querySelector('#total-price');
      if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice;
      }

      // Also update Sezzle payment amount if present
      const sezzleElement = document.querySelector('.subtotal__payment-plan');
      if (sezzleElement) {
        const dividedPrice = Math.round(freshCartData.total_price / 4);
        let dividedPriceFormatted = formatMoney(dividedPrice, format);

        // Ensure currency is included in Sezzle amount
        if (!dividedPriceFormatted.includes(currency)) {
          dividedPriceFormatted = `${dividedPriceFormatted} ${currency}`;
        }

        const sezzleTextParts = sezzleElement.textContent.split('of ');
        if (sezzleTextParts.length > 1) {
          const restOfText = sezzleTextParts[1].split(' with')[1] || '';
          sezzleElement.textContent = `${sezzleTextParts[0]}of ${dividedPriceFormatted} with${restOfText}`;
        }
      }
    }
  } catch (error) {
    console.error('Error updating cart page subtotal:', error);
  }
}

// Helper function to safely get the money format
function getMoneyFormat() {
  // First try to find the data-money-format attribute
  const formatElement = document.querySelector('[data-money-format]');
  if (formatElement) {
    return formatElement.getAttribute('data-money-format');
  }

  // If not found, use a fallback format that works with JS
  // Don't use liquid syntax as it won't get parsed client-side
  return '${{amount}}'; // Simple dollar format as fallback
}

// Improved formatMoney with direct currency handling
function moneyWithCurrency(amount, currency) {
  // First try to use formatMoney with the format
  const format = getMoneyFormat();
  let formatted = formatMoney(amount, format);

  // If the formatted amount still contains liquid syntax, replace with a clean format
  if (formatted.includes('{{')) {
    // Create a clean JS-friendly format based on locale
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    });

    // Format the amount properly
    formatted = formatter.format(amount / 100);
  }

  // If the formatted amount doesn't include the currency code, add it
  if (!formatted.includes(currency)) {
    formatted = `${formatted} ${currency}`;
  }

  return formatted;
}

function updateQuantity() {
  // Use a single event listener with delegation for better performance
  const cartDrawerSection = document.querySelector(
    '#shopify-section-cart-drawer'
  );
  if (!cartDrawerSection) return;

  cartDrawerSection.addEventListener('click', async (event) => {
    // Only proceed if a quantity button was clicked
    if (!event.target.matches('.cart__quantity button')) return;

    const btn = event.target;
    const parentElement = btn.closest('.drawer-cart__item');
    if (!parentElement) return;

    const key = parentElement.getAttribute('data-line-item-key');
    if (!key) return;

    const inputElement = btn.parentElement.querySelector('input');
    const currentQuantity = Number(inputElement.value);
    const isUp = btn.classList.contains('quantity__increment');
    const newQuantity = isUp ? currentQuantity + 1 : currentQuantity - 1;

    // Special handling for zero quantity
    if (newQuantity <= 0) {
      removeItemFromCart(key);
      return;
    }

    // Optimistic UI update
    inputElement.value = newQuantity;

    // Also update the cart page input if it exists
    const cartPageItem = document.querySelector(
      `.drawer-cart__item--cart-page[data-line-item-key="${key}"]`
    );
    if (cartPageItem) {
      const cartPageInput = cartPageItem.querySelector('.cart__quantity input');
      if (cartPageInput) {
        cartPageInput.value = newQuantity;
      }
    }

    try {
      // Update the cart on the server
      const response = await fetch('/cart/update.js', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: { [key]: newQuantity } }),
      });

      const freshCartData = await response.json();
      const currency = freshCartData.currency || 'USD';

      // Format the price
      let totalPrice = moneyWithCurrency(freshCartData.total_price, currency);

      // Update the subtotal
      const drawerSubtotal = document.querySelector(
        '.drawer-cart__footer .subtotal__total'
      );
      if (drawerSubtotal) {
        drawerSubtotal.textContent = totalPrice;
      }

      // Update all necessary elements
      updateAllSezzlePayments(freshCartData.total_price, currency);
      updateFromCartData(freshCartData, key, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert UI to previous state on error
      inputElement.value = currentQuantity;

      if (cartPageItem) {
        const cartPageInput = cartPageItem.querySelector(
          '.cart__quantity input'
        );
        if (cartPageInput) {
          cartPageInput.value = currentQuantity;
        }
      }
    }
  });
}

// Update the updateAllSezzlePayments function to use our improved formatting
function updateAllSezzlePayments(cartTotal, currency) {
  try {
    // Get all Sezzle payment elements
    const sezzleElements = document.querySelectorAll('.sezzle-payment-plan');
    if (!sezzleElements.length) return;

    // Calculate the divided price once
    const dividedPrice = Math.round(cartTotal / 4);
    let formattedDividedPrice = moneyWithCurrency(dividedPrice, currency);

    // Update all Sezzle elements found
    sezzleElements.forEach((element) => {
      // Get the text structure so we can preserve it
      const sezzleTextParts = element.textContent.split('of ');
      if (sezzleTextParts.length > 1) {
        const prefix = sezzleTextParts[0];

        // Extract the "with Sezzle" part
        const withPart = sezzleTextParts[1].split(' with')[1] || '';

        // Update with the new amount
        element.textContent = `${prefix}of ${formattedDividedPrice} with${withPart}`;
      }
    });
  } catch (error) {
    console.error('Error updating Sezzle payments:', error);
  }
}

// Update all other functions to use the new moneyWithCurrency function
function updateFromCartData(cartData, key, quantity) {
  // Get the currency
  const currency = cartData.currency || 'USD';

  if (cartData.total_price !== undefined) {
    // Format the price with our improved function
    let totalPrice = moneyWithCurrency(cartData.total_price, currency);

    // Update subtotals in both drawer and cart page
    updateSubtotals(cartData, totalPrice);
  }

  // Update cart page quantity if it exists
  updateCartPageQuantity(key, quantity);

  // Update cart count
  updateCartItemCount(cartData.item_count);

  // Check subscription status
  checkCartForSubscriptions();
}

// Helper function to update all subtotals
function updateSubtotals(cartData, formattedTotal) {
  // Update drawer subtotal
  const drawerSubtotal = document.querySelector('.subtotal__total');
  if (drawerSubtotal) {
    drawerSubtotal.textContent = formattedTotal;
  }

  // Update cart page subtotal if it exists
  const pageSubtotal = document.querySelector('#total-price');
  if (pageSubtotal) {
    pageSubtotal.textContent = formattedTotal;
  }

  // Update Sezzle in both places
  updateSezzleAmounts(cartData);
}

// Helper to update Sezzle amounts
function updateSezzleAmounts(cartData) {
  const format = document
    .querySelector('[data-money-format]')
    ?.getAttribute('data-money-format');
  const currency = cartData.currency || 'USD';

  if (!format) return;

  const dividedPrice = Math.round(cartData.total_price / 4);
  let formattedDividedPrice = formatMoney(dividedPrice, format);
  if (!formattedDividedPrice.includes(currency)) {
    formattedDividedPrice = `${formattedDividedPrice} ${currency}`;
  }

  // Update in drawer
  const drawerSezzle = document.querySelector(
    '.drawer-cart__footer .subtotal__payment-plan'
  );
  updateSezzleElement(drawerSezzle, formattedDividedPrice);

  // Update in cart page
  const pageSezzle = document.querySelector(
    '.cart-page .subtotal__payment-plan'
  );
  updateSezzleElement(pageSezzle, formattedDividedPrice);
}

// Helper to update a single Sezzle element
function updateSezzleElement(element, formattedAmount) {
  if (!element) return;

  const sezzleTextParts = element.textContent.split('of ');
  if (sezzleTextParts.length > 1) {
    const restOfText = sezzleTextParts[1].split(' with')[1] || '';
    element.textContent = `${sezzleTextParts[0]}of ${formattedAmount} with${restOfText}`;
  }
}

// Function to update drawer cart subtotal from cart data
function updateDrawerCartSubtotal(cartData) {
  const currency = cartData.currency || 'USD';
  let totalPrice = moneyWithCurrency(cartData.total_price, currency);

  // Update subtotals in both places
  updateSubtotals(cartData, totalPrice);
}

export async function updateCart() {
  try {
    // Get the section content first
    const res = await fetch('/?section_id=cart-drawer');
    const text = await res.text();
    const html = document.createElement('div');
    html.innerHTML = text;

    // Get the drawer element and check its state once
    const drawerElement = document.querySelector(drawerCartEl);
    const isDrawerOpen = drawerElement.classList.contains('drawer--active');
    const classListArray = Array.from(drawerElement.classList);

    // Get the drawer content
    const updatedDrawerContainer = html.querySelector(drawerCartEl).innerHTML;

    // Update the drawer content
    drawerElement.innerHTML = updatedDrawerContainer;

    // Re-attach event listener to close button in one operation
    const closeButton = document.querySelector('#cart-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        closeDrawer(document.querySelector(drawerCartEl), '100%');
        e.stopPropagation();
      });
    }

    // Check for subscription items
    checkCartForSubscriptions();

    // Restore drawer state if it was open
    if (isDrawerOpen) {
      drawerElement.classList.add('drawer--active');

      // Restore other classes
      classListArray.forEach((cls) => {
        if (cls !== 'drawer--active') drawerElement.classList.add(cls);
      });
    }

    // Update quantity handlers in one go
    updateQuantity();

    // Use requestAnimationFrame for better performance than setTimeout
    requestAnimationFrame(() => {
      // Re-attach event listeners to remove buttons
      removeItems();

      // Ensure drawer state is correct
      if (isDrawerOpen && !drawerElement.classList.contains('drawer--active')) {
        drawerElement.classList.add('drawer--active');
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Add a debounce helper to reduce frequency of API calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Last known subscription state to avoid unnecessary updates
let lastKnownSubscriptionState = null;

// Function to check if the cart has subscription items
// and update Sezzle UI visibility accordingly
function checkCartForSubscriptions() {
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cart) => {
      // Check if any items have subscriptions
      let hasSubscriptionItems = false;
      for (const item of cart.items) {
        if (item.selling_plan_allocation) {
          hasSubscriptionItems = true;
          break; // No need to check further
        }
      }

      // Only update if state has changed
      if (lastKnownSubscriptionState !== hasSubscriptionItems) {
        lastKnownSubscriptionState = hasSubscriptionItems;

        // Update Sezzle UI visibility
        updateSezzleVisibility(hasSubscriptionItems);

        // Trigger an event so other components can respond
        document.dispatchEvent(
          new CustomEvent('cart:updated', {
            detail: { hasSubscriptionItems },
          })
        );
      }
    })
    .catch((error) => console.error('Error checking cart in drawer:', error));
}

// Create a debounced version for frequent calls
const debouncedCheckCartForSubscriptions = debounce(
  checkCartForSubscriptions,
  300
);
export { debouncedCheckCartForSubscriptions };

// Function to update Sezzle visibility in cart drawer
function updateSezzleVisibility(hasSubscriptionItems) {
  try {
    // Find all Sezzle payment plan elements using the class - cache the NodeList
    const sezzleElements = document.querySelectorAll('.sezzle-payment-plan');
    if (!sezzleElements.length) return;

    // Use display style directly without logging for better performance
    const displayStyle = hasSubscriptionItems ? 'none' : 'block';

    sezzleElements.forEach((element) => {
      element.style.display = displayStyle;
    });
  } catch (error) {
    console.error('Error updating Sezzle visibility:', error);
  }
}

// Check on document ready
document.addEventListener('DOMContentLoaded', function () {
  // Immediate check on page load
  checkCartForSubscriptions();

  // Use debounced version for the cart:updated event
  document.addEventListener('cart:updated', function () {
    debouncedCheckCartForSubscriptions();
  });
});

export const attachEventListeners = () => {
  addToCart.forEach((form) => attachFormEventListeners(form));
};

// Shared form event listener logic to avoid duplication
function attachFormEventListeners(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Optimistically update UI
    openDrawer(drawerCart);
    showLoadingInCart();

    // Process form submission - use a function for this shared code
    processFormSubmission(form);
  });
}

// Centralized form submission handler to avoid code duplication
async function processFormSubmission(form) {
  // Create a new FormData object
  const formData = new FormData();

  // Try to select a checked radio button first
  let variantIdInput = form.querySelector('input[type=radio][name=id]:checked');

  // If there's no checked radio button, select the hidden input field
  if (!variantIdInput) {
    variantIdInput = form.querySelector('input[type=hidden][name=id]');
  }

  // Make sure the input field exists before trying to read its value
  if (variantIdInput) {
    const variantId = variantIdInput.value;
    formData.append('id', variantId);

    // Append the quantity
    const quantityInput = form.querySelector(
      `input[data-variant-id="${variantId}"]`
    );
    const quantity = quantityInput ? quantityInput.value : '1';
    formData.append('quantity', quantity);

    // Check for and append selling plan if present
    const sellingPlanInput = form.querySelector('input[name="selling_plan"]');
    if (
      sellingPlanInput &&
      sellingPlanInput.value &&
      sellingPlanInput.value.trim() !== ''
    ) {
      formData.append('selling_plan', sellingPlanInput.value);
    }

    try {
      // Submit form with AJAX
      await fetch('/cart/add', {
        method: 'post',
        body: formData,
      });

      // Get cart count
      const resCart = await fetch('/cart.js');
      const cartCount = await resCart.json();
      updateCartItemCount(cartCount.item_count);

      // Update cart without page reload
      await updateCart();

      // Ensure drawer is open
      openDrawer(drawerCart);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  } else {
    console.error('No variant ID input field found');
  }
}

export const attachEventListenersToProduct = (productForm) => {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Optimistically update UI
    openDrawer(drawerCart);
    showLoadingInCart();

    // Reuse the same form submission logic
    processFormSubmission(productForm);
  });
};

const CartDrawer = () => {
  // Check for subscription items immediately on initialization
  checkCartForSubscriptions();

  // Attach event listeners to remove buttons of items already in cart
  removeItems();

  // Attach events to all "add to cart" forms
  addToCart.forEach((form) => attachFormEventListeners(form));

  updateCartLinks();
  updateQuantity();
};

export default CartDrawer;
