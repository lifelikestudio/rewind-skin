import axios from 'axios';
import {
  updateCartItemCount,
  debouncedCheckCartForSubscriptions,
} from '../Drawers/CartDrawer.js';

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

export function formatMoney(cents, format) {
  if (typeof cents == 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;

  // Special handling to ensure currency code is included like money_with_currency filter
  const isMissingCurrency = !formatString.includes('currency');
  if (isMissingCurrency && formatString.includes('amount')) {
    // Don't add hard-coded currency - use the existing format
    // and allow Shopify's templates to handle the currency
    // This will preserve the original format and let Liquid handle currency
  }

  function defaultOption(opt, def) {
    return typeof opt == 'undefined' ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents = parts[1] ? decimal + parts[1] : '';

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

async function updateCart() {
  const res = await fetch('/cart.js');
  const cartData = await res.json();

  console.log('Cart data:', cartData); // Debug to see the structure

  // If there are no items left in the cart, display the "empty cart" message
  if (cartData.items.length === 0) {
    document.querySelector('.cart-page').innerHTML = `
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
    return;
  }

  // Update cart item count - use the imported function to update ALL count elements
  updateCartItemCount(cartData.item_count);

  // Update total price
  const format = getMoneyFormat();
  const totalPrice = formatMoney(cartData.total_price, format);
  document.querySelector('#total-price').textContent = totalPrice;

  // Enhanced check for subscription items
  let hasSubscriptionItems = false;

  // Log all items for debugging
  console.log('All cart items:', cartData.items);

  // Check each item for a selling plan allocation
  for (const item of cartData.items) {
    console.log(
      `Checking item ${item.key} for subscription:`,
      item.selling_plan_allocation
    );
    if (item.selling_plan_allocation) {
      hasSubscriptionItems = true;
      console.log('Found subscription item:', item);
      break; // No need to check further
    }
  }

  // Use the unified function to update Sezzle visibility in both cart page and drawer
  updateSezzleVisibility(hasSubscriptionItems);

  // Update subscription information for each item
  cartData.items.forEach((item) => {
    console.log('Processing item:', item.key);
    console.log('Item variant title:', item.variant_title);
    console.log('Item price:', item.price);

    // Log the full selling plan details
    if (item.selling_plan_allocation) {
      console.log('Selling plan details:', {
        id: item.selling_plan_allocation.selling_plan.id,
        name: item.selling_plan_allocation.selling_plan.name,
        price: item.selling_plan_allocation.price,
        compareAtPrice: item.selling_plan_allocation.compare_at_price,
        perDeliveryPrice: item.selling_plan_allocation.per_delivery_price,
      });
    } else {
      console.log('No selling plan for this item');
    }

    // Find the item element in the cart page
    const itemElement = document.querySelector(
      `.drawer-cart__item--cart-page[data-line-item-key="${item.key}"]`
    );

    if (!itemElement) {
      console.log(`Item element not found for key: ${item.key}`);
      return;
    }

    // Find the price element and log its current state
    const priceElement = itemElement.querySelector('.item__variant-price');
    if (!priceElement) {
      console.log(`Price element not found for item: ${item.key}`);
      return;
    }

    console.log('Current price element text:', priceElement.textContent);

    // Get the current text of the price element
    const currentText = priceElement.textContent || '';

    // Check if this item has a selling plan
    if (
      item.selling_plan_allocation &&
      item.selling_plan_allocation.selling_plan
    ) {
      const sellingPlanName = item.selling_plan_allocation.selling_plan.name;

      // Force a complete rebuild of the price text instead of trying to append
      // This ensures correct format even if previous attempts were partially successful

      // Parse the current text to extract the size and price components
      let size = '';
      let price = '';

      // First, try to extract based on standard format
      const parts = currentText.split(' / ');
      if (parts.length >= 2) {
        size = parts[0];

        // For the price part, make sure we don't include any subscription info
        price = parts[1].split(' / ')[0]; // Take only the first part of price segment
      } else {
        // Fallback if format doesn't match expectations
        console.log('Unexpected price format, using full text as base');
        size = item.variant_title || '';
        price = formatMoney(item.price, format);
      }

      // Create a fresh price string with the subscription info
      priceElement.textContent = `${size} / ${price} / ${sellingPlanName}`;
      console.log('Updated price element text:', priceElement.textContent);
    } else {
      // Handle one-time purchase items
      // If there's subscription info in the text, clean it up
      if (
        currentText.includes(' / Every ') ||
        currentText.includes(' / Monthly ') ||
        currentText.split(' / ').length > 2
      ) {
        const parts = currentText.split(' / ');
        if (parts.length >= 2) {
          // Keep just the first two parts (size and price)
          priceElement.textContent = `${parts[0]} / ${parts[1]}`;
          console.log('Cleaned up price text:', priceElement.textContent);
        }
      }
    }
  });

  // Remove items with quantity 0 from the cart page
  cartData.items.forEach((item) => {
    if (item.quantity === 0) {
      const itemElement = document.querySelector(
        `.drawer-cart__item--cart-page[data-line-item-key="${item.key}"]`
      );
      if (itemElement) {
        itemElement.remove();
      }
    }
  });

  // Re-attach event listeners
  quantityHandler();
}

function removeItem(e) {
  if (e.target.matches('.item__info--cart-page .item__remove')) {
    e.preventDefault();
    const item = e.target.closest('.drawer-cart__item--cart-page');
    const key = e.target.getAttribute('data-line-item-key');

    // Use the shared removeItemFromCart function which properly updates both cart instances
    removeItemFromCart(key);
  }
}

if (document.querySelector('.cart-page')) {
  document.querySelector('.cart-page').addEventListener('click', removeItem);
}

const quantityBtns = document.querySelectorAll(
  '.cart-page .cart__quantity button'
);

const quantityHandler = () => {
  quantityBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const value = Number(input.value);
        const isPlus = btn.classList.contains('quantity__increment');
        const cartItem = btn.closest('.drawer-cart__item--cart-page');
        const key = cartItem.getAttribute('data-line-item-key');
        let newValue;
        if (isPlus) {
          newValue = value + 1;
        } else {
          newValue = value - 1;
        }
        changeItemQuantity(key, newValue, value, input);
      });
    }
  });
};

function updateDrawerCartQuantity(key, quantity) {
  // Find the corresponding item in the DrawerCart
  const drawerCartItem = document.querySelector(
    `.drawer-cart__item[data-line-item-key="${key}"]`
  );

  // Update its quantity value
  if (drawerCartItem) {
    const quantityInput = drawerCartItem.querySelector('.cart__quantity input');
    if (quantityInput) {
      quantityInput.value = quantity;
    }
  }
}

export function removeItemFromCart(key) {
  axios
    .post('/cart/change.js', {
      id: key,
      quantity: 0,
    })
    .then(async (res) => {
      // Remove the item from drawer cart UI immediately
      const drawerItem = document.querySelector(
        `.drawer-cart__item[data-line-item-key="${key}"]`
      );
      if (drawerItem) {
        drawerItem.remove();
      }

      // Also remove the item from the cart page UI
      const cartPageItem = document.querySelector(
        `.drawer-cart__item--cart-page[data-line-item-key="${key}"]`
      );
      if (cartPageItem) {
        cartPageItem.remove();
      }

      // Fetch the updated cart data
      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();

      // Update the cart item count in the UI
      updateCartItemCount(cartData.item_count);

      // If this was the last item, update both the cart page and drawer cart to empty state
      if (cartData.items.length === 0) {
        // Update cart page to empty state if we're on it
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

        // Update drawer cart to empty state WITHOUT closing it
        const drawerCart = document.querySelector('#drawer-cart');
        if (drawerCart) {
          // IMPORTANT: Save the active state to reapply it after updating content
          const isActive = drawerCart.classList.contains('drawer--active');

          // Update drawer content
          drawerCart.innerHTML = `
            <div class="drawer__header">
              <h2 class="drawer__top-level-heading">Bag</h2>
              <button class="all-caps drawer__header-action" id="cart-close">Close</button>
            </div>
            <div class="drawer__container drawer__container--cart">
              <div class="drawer-cart__empty">
                <h3 class="drawer-cart__empty-message">Your bag is empty.</h3>
                <a href="/collections/all" class="btn btn--secondary all-caps drawer-cart__empty-continue">Continue Shopping</a>
              </div>
            </div>
          `;

          // Re-add the active class if it was active before
          if (isActive) {
            drawerCart.classList.add('drawer--active');
          }

          // Re-attach event listener to close button
          const closeButton = document.querySelector('#cart-close');
          if (closeButton) {
            closeButton.addEventListener('click', (e) => {
              if (typeof closeDrawer === 'function') {
                // Get direct DOM reference instead of possibly stale object
                const drawer = document.querySelector('#drawer-cart');
                closeDrawer(drawer, '100%');
                e.stopPropagation();
              }
            });
          }
        }
      } else {
        // Otherwise just remove the specific item
        const itemElement = document.querySelector(
          `.drawer-cart__item--cart-page[data-line-item-key="${key}"]`
        );
        if (itemElement) {
          itemElement.remove();
        }
      }

      // Update the quantity value in the DrawerCart
      updateDrawerCartQuantity(key, 0);

      // Update the subtotals in both drawer and cart page
      const currency = cartData.currency || 'USD';

      // Format with improved function
      let totalPrice = moneyWithCurrency(cartData.total_price, currency);

      // Update cart page subtotal
      const totalPriceElement = document.querySelector('#total-price');
      if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice;
      }

      // Update all Sezzle payment amounts
      updateAllSezzlePayments(cartData.total_price, currency);

      // Update drawer cart subtotal
      updateDrawerCartSubtotal(cartData, currency);

      // Check for subscription status to update Sezzle visibility
      checkCartForSubscriptions();
    })
    .catch((error) => {
      console.error('Error removing item from cart:', error);
      alert(error.message);
    });
}

function changeItemQuantity(key, quantity, previousValue, inputElement) {
  inputElement.value = quantity; // Update the input value to the new quantity
  if (quantity < 1) {
    removeItemFromCart(key);
    inputElement.value = 0; // Show 0 in the UI
    return;
  }

  // First fetch the current cart to get the selling plan ID if any
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cartData) => {
      const item = cartData.items.find((item) => item.key === key);
      const sellingPlanId =
        item && item.selling_plan_allocation
          ? item.selling_plan_allocation.selling_plan.id
          : null;

      // Now update the cart with the selling plan ID if needed
      const updateData = {
        id: key,
        quantity: quantity,
      };

      if (sellingPlanId) {
        updateData.selling_plan = sellingPlanId;
      }

      return axios.post('/cart/change.js', updateData);
    })
    .then(async (res) => {
      // We'll fetch the full cart data to ensure accuracy of totals
      const freshCartRes = await fetch('/cart.js');
      const freshCartData = await freshCartRes.json();

      // Get the currency directly from the cart data
      const currency = freshCartData.currency || 'USD';

      // Update cart item count
      updateCartItemCount(freshCartData.item_count);

      // Format total price with correct currency using our improved function
      const totalPrice = moneyWithCurrency(freshCartData.total_price, currency);

      // Update the total price
      const totalPriceEl = document.querySelector('#total-price');
      if (totalPriceEl) {
        totalPriceEl.textContent = totalPrice;
      }

      // Use the unified function to update all Sezzle payments
      updateAllSezzlePayments(freshCartData.total_price, currency);

      // UPDATE: Also update the drawer cart subtotal
      updateDrawerCartSubtotal(freshCartData, currency);

      const item = freshCartData.items.find((item) => item.key === key);

      // Update the quantity value in the DrawerCart and in the current view
      // Use the actual quantity returned from Shopify (which may be limited by stock)
      const actualQuantity = item ? item.quantity : 0;
      updateDrawerCartQuantity(key, actualQuantity);
      inputElement.value = actualQuantity;

      // Find the item element
      const itemElement = document.querySelector(
        `.drawer-cart__item--cart-page[data-line-item-key="${key}"]`
      );

      // Check for selling plan and update price display
      if (itemElement) {
        const priceElement = itemElement.querySelector('.item__variant-price');

        if (priceElement) {
          console.log('Updating price for item after quantity change:', key);

          // Get current text and log it
          let currentText = priceElement.textContent || '';
          console.log('Current price text:', currentText);

          // Parse the current text to extract components
          let size = '';
          let price = '';

          const parts = currentText.split(' / ');
          if (parts.length >= 2) {
            size = parts[0];
            // For the price part, make sure we don't include any subscription info
            price = parts[1].split(' / ')[0]; // Take only the first part of price segment
          } else {
            // Fallback
            size = item.variant_title || '';
            // Use our new formatting function
            price = moneyWithCurrency(item.price, currency);
          }

          // Build the updated price text based on whether there's a selling plan
          if (
            item.selling_plan_allocation &&
            item.selling_plan_allocation.selling_plan
          ) {
            const sellingPlanName =
              item.selling_plan_allocation.selling_plan.name;
            priceElement.textContent = `${size} / ${price} / ${sellingPlanName}`;
          } else {
            priceElement.textContent = `${size} / ${price}`;
          }

          console.log(
            'Updated price text after quantity change:',
            priceElement.textContent
          );
        }
      } else {
        console.log(
          `Item element not found for key: ${key} after quantity update`
        );
      }

      // Check for subscription status to update Sezzle visibility
      checkCartForSubscriptions();
    })
    .catch((error) => {
      // Special handling for 422 status (inventory constraints)
      if (error.response && error.response.status === 422) {
        // Get the maximum available quantity from the cart - silently
        fetch('/cart.js')
          .then((res) => res.json())
          .then((cart) => {
            const currentItem = cart.items.find((item) => item.key === key);
            if (currentItem) {
              // Update to the current quantity in the cart
              inputElement.value = currentItem.quantity;
              updateDrawerCartQuantity(key, currentItem.quantity);
            } else {
              // If item not found, revert to previous value
              inputElement.value = previousValue;
            }
          })
          .catch((err) => {
            // Silently revert to previous value
            inputElement.value = previousValue;
          });
      } else {
        // Only log and show alerts for non-inventory related errors
        console.error('Error changing item quantity:', error);
        alert(error.message);
        inputElement.value = previousValue;
      }
    });
}

// New function to update the drawer cart subtotal
function updateDrawerCartSubtotal(cartData, currency) {
  // Format with improved function
  let totalPrice = moneyWithCurrency(cartData.total_price, currency);

  // Find the subtotal element in the drawer cart
  const drawerSubtotalEl = document.querySelector(
    '.drawer-cart__footer .subtotal__total'
  );
  if (drawerSubtotalEl) {
    drawerSubtotalEl.textContent = totalPrice;

    // Also update the Sezzle amount in the drawer if present
    const drawerSezzleEl = document.querySelector(
      '.drawer-cart__footer .subtotal__payment-plan'
    );
    if (drawerSezzleEl) {
      const dividedPrice = Math.round(cartData.total_price / 4);
      let formattedDividedPrice = moneyWithCurrency(dividedPrice, currency);

      const sezzleTextParts = drawerSezzleEl.textContent.split('of ');
      if (sezzleTextParts.length > 1) {
        const restOfText = sezzleTextParts[1].split(' with')[1] || '';
        drawerSezzleEl.textContent = `${sezzleTextParts[0]}of ${formattedDividedPrice} with${restOfText}`;
      }
    }
  }
}

const CartPage = () => {
  // Hide Sezzle UI immediately on page load if subscriptions are in cart
  checkCartForSubscriptions();

  quantityHandler();

  // Debug to check DOM structure and cart data
  console.log('CartPage initialized');
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cart) => {
      console.log('Current cart:', cart);

      if (cart.items.length > 0) {
        // Check if any items have selling plans
        const itemsWithSellingPlans = cart.items.filter(
          (item) => item.selling_plan_allocation
        );
        console.log('Items with selling plans:', itemsWithSellingPlans);

        // Check if we can find the DOM elements for these items
        cart.items.forEach((item) => {
          const element = document.querySelector(
            `.drawer-cart__item--cart-page[data-line-item-key="${item.key}"]`
          );
          console.log(`Item ${item.key}:`, {
            found: !!element,
            element: element,
            sellingPlan: item.selling_plan_allocation,
          });
        });
      }
    });
};

// Function to specifically check if the cart has subscription items
// and update Sezzle UI visibility accordingly
function checkCartForSubscriptions() {
  // Use the debounced function from CartDrawer for better performance
  debouncedCheckCartForSubscriptions();
}

// Unified function to update Sezzle visibility in both cart page and drawer
function updateSezzleVisibility(hasSubscriptionItems) {
  // Find all Sezzle payment plan elements using the new class
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

// Add event listener for cart changes from other contexts
document.addEventListener('DOMContentLoaded', function () {
  // Check on page load
  checkCartForSubscriptions();

  // Check when any cart updates happen elsewhere
  document.addEventListener('cart:updated', function (event) {
    console.log('Cart updated event detected, checking subscriptions');
    // Only update Sezzle visibility, don't modify the cart
    checkCartForSubscriptions();
  });
});

// New unified function to update all Sezzle payment elements consistently
function updateAllSezzlePayments(cartTotal, currency) {
  // Get all Sezzle payment elements
  const sezzleElements = document.querySelectorAll('.sezzle-payment-plan');

  // Calculate the divided price once
  const dividedPrice = Math.round(cartTotal / 4);
  let formattedDividedPrice = moneyWithCurrency(dividedPrice, currency);

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

export default CartPage;
