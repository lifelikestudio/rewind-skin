import { openDrawer, closeDrawer } from './DrawerHandlers';
import { drawerCart } from './Drawers.js';

// Import formatMoney function from CartPage.js
import { formatMoney } from '../Shop/CartPage.js';

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

function showLoadingInCart() {
  const cartItemsContainer = document.querySelector('.drawer__container--cart');
  cartItemsContainer.innerHTML = `
  <div class="fill-loader fill-loader--v1" role="alert">
    <p class="fill-loader__label">Content is loading...</p>
    <div aria-hidden="true">
      <div class="fill-loader__base"></div>
      <div class="fill-loader__fill"></div>
    </div>
  </div>
  `;
}

function removeItems() {
  const removeItemButtons = document.querySelectorAll('.item__remove');
  removeItemButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Use line item key instead of variant ID
      const lineItemKey = btn.dataset.lineItemKey;

      await fetch(`/cart/change.js`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Use the line item key to target the specific item
          id: lineItemKey,
          quantity: 0,
        }),
      });

      // Update cart
      await updateCart();

      // Get updated cart data
      const res = await fetch('/cart.js');
      const cartData = await res.json();

      // Update cart item count
      updateCartItemCount(cartData.item_count);

      // If this was the last item, update the entire cart view
      if (cartData.items.length === 0) {
        updateCart();
      } else {
        // Otherwise just remove the specific item
        const itemElement = document.querySelector(
          `.drawer-cart__item--cart-page[data-key="${lineItemKey}"]`
        );
        if (itemElement) {
          itemElement.remove();
        }
      }
    });
  });
}

function updateCartPageQuantity(key, quantity) {
  // Find the corresponding item in the CartPage
  const cartPageItem = document.querySelector(
    `.drawer-cart__item--cart-page[data-key="${key}"]`
  );

  console.log(`Updating cart page quantity for item ${key} to ${quantity}`);

  // Update its quantity value
  if (cartPageItem) {
    const quantityInput = cartPageItem.querySelector('.cart__quantity input');
    if (quantityInput) {
      quantityInput.value = quantity;
      console.log(`Updated cart page quantity input to ${quantity}`);

      // After updating quantity, also update subtotal
      updateCartPageSubtotal();
    } else {
      console.log('Cart page quantity input not found');
    }
  } else {
    console.log('Cart page item not found');

    // If we're on the cart page and the item isn't found, try to reload the cart
    if (document.querySelector('.cart-page')) {
      console.log('On cart page, refreshing');
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

  // If not found, use a fallback format
  // This is the standard Shopify money format with currency
  return '{{amount_with_comma_separator}} {{currency}}';
}

function updateQuantity() {
  // Update quantity with btns
  const quantityBtns = document.querySelectorAll(
    '#shopify-section-cart-drawer .cart__quantity button'
  );
  quantityBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rootItem = btn.parentElement.parentElement.parentElement;
      const key = rootItem.getAttribute('data-line-item-key');
      const currentQuantity = Number(
        btn.parentElement.querySelector('input').value
      );
      // Update the quantity value in the CartPage
      const isUp = btn.classList.contains('quantity__increment');
      const newQuantity = isUp ? currentQuantity + 1 : currentQuantity - 1;

      // Special handling for zero quantity
      if (newQuantity <= 0) {
        console.log('Removing item with key:', key);

        // Optimistically update UI first for better perceived performance
        const drawerItem = document.querySelector(
          `.drawer-cart__item[data-line-item-key="${key}"]`
        );
        if (drawerItem) {
          drawerItem.remove();
        }

        const cartPageItem = document.querySelector(
          `.drawer-cart__item--cart-page[data-key="${key}"]`
        );
        if (cartPageItem) {
          cartPageItem.remove();
        }

        // Now update the server (in parallel with UI updates)
        const response = await fetch('/cart/change.js', {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: key, quantity: 0 }),
        });
        const freshCartData = await response.json();

        // Check if cart is empty after removal
        if (freshCartData.items.length === 0) {
          console.log('Cart is now empty, updating cart page to empty state');
          // If we're on the cart page, update it to show the empty state
          const cartPage = document.querySelector('.cart-page');
          if (cartPage) {
            cartPage.innerHTML = `
              <div class="drawer__header drawer__header--cart-page">
                <div class="wrapper wrapper--sm"><h1 class="drawer__top-level-heading">Bag</h1></div>
              </div>
              <div class="drawer__container drawer__container--cart drawer__container--cart-page">
                <div class="wrapper wrapper--sm drawer-cart__empty drawer-cart__empty--cart-page">
                  <h3 class="drawer-cart__empty-message">Your bag is empty.</h3>
                  <a href="/collections/all" class="btn btn--secondary all-caps drawer-cart__empty-continue">Continue Shopping</a>
                </div>
              </div>
            `;
          }
        }

        // Update cart count immediately using the data we already have
        updateCartItemCount(freshCartData.item_count);

        // Update the drawer cart subtotal using the data we already have
        updateDrawerCartSubtotal(freshCartData);

        // Update the entire drawer cart
        updateCart();

        // Check for subscriptions
        checkCartForSubscriptions();

        return;
      }

      // For positive quantities - optimistic UI update first
      const inputElement = btn.parentElement.querySelector('input');
      inputElement.value = newQuantity; // Update UI immediately

      // Also update the corresponding input in cart page for better perceived performance
      const cartPageItem = document.querySelector(
        `.drawer-cart__item--cart-page[data-key="${key}"]`
      );
      if (cartPageItem) {
        const cartPageInput = cartPageItem.querySelector(
          '.cart__quantity input'
        );
        if (cartPageInput) {
          cartPageInput.value = newQuantity;
        }
      }

      // Then send the update to the server
      const response = await fetch('/cart/update.js', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: { [key]: newQuantity } }),
      });
      const freshCartData = await response.json();

      // IMPORTANT: Update drawer subtotal immediately
      const format = getMoneyFormat(); // Use our safe helper function
      const currency = freshCartData.currency || 'USD';

      // Format the price with correct currency
      let totalPrice = formatMoney(freshCartData.total_price, format);

      // Ensure currency is included
      if (!totalPrice.includes(currency)) {
        totalPrice = `${totalPrice} ${currency}`;
      }

      // Update the drawer subtotal immediately
      const drawerSubtotal = document.querySelector(
        '.drawer-cart__footer .subtotal__total'
      );
      if (drawerSubtotal) {
        console.log('Updating drawer subtotal to:', totalPrice);
        drawerSubtotal.textContent = totalPrice;
      }

      // Update Sezzle in the drawer
      updateAllSezzlePayments(freshCartData.total_price, format, currency);

      // Use the response data we already have instead of making another fetch
      updateFromCartData(freshCartData, key, newQuantity);
    });
  });
}

// Helper function to update all Sezzle payment elements
function updateAllSezzlePayments(cartTotal, format, currency) {
  // Get all Sezzle payment elements
  const sezzleElements = document.querySelectorAll('.sezzle-payment-plan');

  // If format wasn't provided, get it
  if (!format) {
    format = getMoneyFormat();
  }

  // Calculate the divided price once
  const dividedPrice = Math.round(cartTotal / 4);
  let formattedDividedPrice = formatMoney(dividedPrice, format);

  // Ensure currency is included
  if (!formattedDividedPrice.includes(currency)) {
    formattedDividedPrice = `${formattedDividedPrice} ${currency}`;
  }

  // Update all Sezzle elements found
  sezzleElements.forEach((element) => {
    console.log(
      'Updating Sezzle element with divided price:',
      formattedDividedPrice
    );

    // Get the text structure so we can preserve it
    const sezzleTextParts = element.textContent.split('of ');
    if (sezzleTextParts.length > 1) {
      const prefix = sezzleTextParts[0];

      // Extract the "with Sezzle" part
      const withPart = sezzleTextParts[1].split(' with')[1] || '';

      // Update with the new amount
      element.textContent = `${prefix}of ${formattedDividedPrice} with${withPart}`;
      console.log('Updated Sezzle text:', element.textContent);
    }
  });
}

// New helper function to update UI from cart data (avoiding duplicate fetches)
function updateFromCartData(cartData, key, quantity) {
  // Get the money format
  const format = getMoneyFormat();
  const currency = cartData.currency || 'USD';

  if (format && cartData.total_price !== undefined) {
    // Format the price
    let totalPrice = formatMoney(cartData.total_price, format);

    // Ensure currency is included
    if (!totalPrice.includes(currency)) {
      totalPrice = `${totalPrice} ${currency}`;
    }

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
  const format = getMoneyFormat();
  if (!format) return;

  const currency = cartData.currency || 'USD';
  let totalPrice = formatMoney(cartData.total_price, format);

  // Ensure currency is included
  if (!totalPrice.includes(currency)) {
    totalPrice = `${totalPrice} ${currency}`;
  }

  // Update subtotals in both places
  updateSubtotals(cartData, totalPrice);
}

export async function updateCart() {
  const res = await fetch('/?section_id=cart-drawer');
  const text = await res.text();
  const html = document.createElement('div');
  html.innerHTML = text;
  const updatedDrawerContainer = html.querySelector(drawerCartEl).innerHTML;
  document.querySelector(drawerCartEl).innerHTML = updatedDrawerContainer;

  // Re-attach event listener to close button
  const closeButton = document.querySelector('#cart-close');
  closeButton.addEventListener('click', (e) => {
    closeDrawer(drawerCart, '100%');
    e.stopPropagation();
  });

  // Ensure prices are properly formatted - though this section uses server-rendered HTML
  // which should already have correct formatting, we ensure consistency

  // Check for subscription items and hide payment plans if needed - call immediately
  checkCartForSubscriptions();

  updateQuantity();

  // Wait until the new HTML has been rendered
  setTimeout(() => {
    // Re-attach event listeners to remove buttons
    removeItems();

    // Re-check after a short delay to ensure all DOM elements are fully loaded
    setTimeout(checkCartForSubscriptions, 100);
  }, 0);
}

// Function to check if the cart has subscription items
// and update Sezzle UI visibility accordingly
function checkCartForSubscriptions() {
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cart) => {
      console.log('Drawer checking for subscriptions:', cart.items);

      // Check if any items have subscriptions
      let hasSubscriptionItems = false;
      for (const item of cart.items) {
        if (item.selling_plan_allocation) {
          hasSubscriptionItems = true;
          console.log('Drawer found subscription item:', item);
          break;
        }
      }

      // Update Sezzle UI visibility
      updateSezzleVisibility(hasSubscriptionItems);

      // Trigger an event so other components can respond
      document.dispatchEvent(
        new CustomEvent('cart:updated', {
          detail: { hasSubscriptionItems },
        })
      );
    })
    .catch((error) => console.error('Error checking cart in drawer:', error));
}

// Function to update Sezzle visibility in cart drawer
function updateSezzleVisibility(hasSubscriptionItems) {
  // Find all Sezzle payment plan elements using the class
  const sezzleElements = document.querySelectorAll('.sezzle-payment-plan');

  sezzleElements.forEach((element) => {
    // Show Sezzle ONLY when there are NO subscription items
    if (!hasSubscriptionItems) {
      element.style.display = 'block';
      console.log('Showing Sezzle payment plan');
    } else {
      element.style.display = 'none';
      console.log('Hiding Sezzle payment plan');
    }
  });

  console.log(
    'Updated all Sezzle elements, subscription items present:',
    hasSubscriptionItems
  );
}

// Check on document ready
document.addEventListener('DOMContentLoaded', function () {
  // Immediate check on page load
  checkCartForSubscriptions();
});

export const attachEventListeners = () => {
  addToCart.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Add to cart button clicked');
      // Optimistically update UI
      openDrawer(drawerCart);
      showLoadingInCart();

      // Delay form submission until after any pending updates to the DOM
      setTimeout(async () => {
        // Create a new FormData object
        const formData = new FormData();

        // Try to select a checked radio button first
        let variantIdInput = form.querySelector(
          'input[type=radio][name=id]:checked'
        );

        // If there's no checked radio button, select the hidden input field
        if (!variantIdInput) {
          variantIdInput = form.querySelector('input[type=hidden][name=id]');
        }

        // Make sure the input field exists before trying to read its value
        if (variantIdInput) {
          const variantId = variantIdInput.value;
          console.log('Variant ID:', variantId);
          formData.append('id', variantId);

          // Append the quantity
          const quantityInput = form.querySelector(
            `input[data-variant-id="${variantId}"]`
          );
          const quantity = quantityInput ? quantityInput.value : '1';
          console.log('Quantity:', quantity);
          formData.append('quantity', quantity);

          // Check for and append selling plan if present
          const sellingPlanInput = form.querySelector(
            'input[name="selling_plan"]'
          );
          if (
            sellingPlanInput &&
            sellingPlanInput.value &&
            sellingPlanInput.value.trim() !== ''
          ) {
            console.log('Adding selling plan to cart:', sellingPlanInput.value);
            formData.append('selling_plan', sellingPlanInput.value);
          }

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
          // Open cart drawer
          openDrawer(drawerCart);
        } else {
          console.error('No variant ID input field found');
        }
      }, 0);
    });
  });
};

export const attachEventListenersToProduct = (productForm) => {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Optimistically update UI
    openDrawer(drawerCart);
    showLoadingInCart();

    // Delay form submission until after any pending updates to the DOM
    setTimeout(async () => {
      // Create a new FormData object
      const formData = new FormData();

      // Try to select a checked radio button first
      let variantIdInput = productForm.querySelector(
        'input[type=radio][name=id]:checked'
      );

      // If there's no checked radio button, select the hidden input field
      if (!variantIdInput) {
        variantIdInput = productForm.querySelector(
          'input[type=hidden][name=id]'
        );
      }

      // Make sure the input field exists before trying to read its value
      if (variantIdInput) {
        const variantId = variantIdInput.value;
        console.log('Variant ID:', variantId);
        formData.append('id', variantId);

        // Append the quantity
        const quantityInput = productForm.querySelector(
          `input[data-variant-id="${variantId}"]`
        );
        const quantity = quantityInput ? quantityInput.value : '1';
        console.log('Quantity:', quantity);
        formData.append('quantity', quantity);

        // Check for and append selling plan if present
        const sellingPlanInput = productForm.querySelector(
          'input[name="selling_plan"]'
        );
        if (
          sellingPlanInput &&
          sellingPlanInput.value &&
          sellingPlanInput.value.trim() !== ''
        ) {
          console.log('Adding selling plan to cart:', sellingPlanInput.value);
          formData.append('selling_plan', sellingPlanInput.value);
        }

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
        // Open cart drawer
        openDrawer(drawerCart);
      } else {
        console.error('No variant ID input field found');
      }
    }, 0);
  });
};

const CartDrawer = () => {
  // Check for subscription items immediately on initialization
  checkCartForSubscriptions();

  // Attach event listeners to remove buttons of items already in cart
  removeItems();

  addToCart.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Add to cart button clicked');
      // Optimistically update UI
      openDrawer(drawerCart);
      showLoadingInCart();

      // Delay form submission until after any pending updates to the DOM
      setTimeout(async () => {
        // Create a new FormData object
        const formData = new FormData();

        // Try to select a checked radio button first
        let variantIdInput = form.querySelector(
          'input[type=radio][name=id]:checked'
        );

        // If there's no checked radio button, select the hidden input field
        if (!variantIdInput) {
          variantIdInput = form.querySelector('input[type=hidden][name=id]');
        }

        // Make sure the input field exists before trying to read its value
        if (variantIdInput) {
          const variantId = variantIdInput.value;
          console.log('Variant ID:', variantId);
          formData.append('id', variantId);

          // Append the quantity
          const quantityInput = form.querySelector(
            `input[data-variant-id="${variantId}"]`
          );
          const quantity = quantityInput ? quantityInput.value : '1';
          console.log('Quantity:', quantity);
          formData.append('quantity', quantity);

          // Check for and append selling plan if present
          const sellingPlanInput = form.querySelector(
            'input[name="selling_plan"]'
          );
          if (
            sellingPlanInput &&
            sellingPlanInput.value &&
            sellingPlanInput.value.trim() !== ''
          ) {
            console.log('Adding selling plan to cart:', sellingPlanInput.value);
            formData.append('selling_plan', sellingPlanInput.value);
          }

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
          // Open cart drawer
          openDrawer(drawerCart);
        } else {
          console.error('No variant ID input field found');
        }
      }, 0);
    });
  });

  addToCart.forEach((form) => {
    attachEventListenersToProduct(form);
  });
  attachEventListeners();
  updateCartLinks();
  updateQuantity();
};

export default CartDrawer;
