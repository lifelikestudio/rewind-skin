import axios from 'axios';
import { updateCartItemCount } from '../Drawers/CartDrawer.js';

function formatMoney(cents, format) {
  if (typeof cents == 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;

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

  // Update cart item count
  document.querySelector(
    '.cart-action__count'
  ).textContent = `(${cartData.item_count})`;

  // Update total price
  const format = document
    .querySelector('[data-money-format]')
    .getAttribute('data-money-format');
  const totalPrice = formatMoney(cartData.total_price, format);
  document.querySelector('#total-price').textContent = totalPrice;

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
      `.drawer-cart__item--cart-page[data-key="${item.key}"]`
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
        `.drawer-cart__item--cart-page[data-key="${item.key}"]`
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
    const key = item.getAttribute('data-key');
    fetch('/cart/update.js', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: { [key]: 0 },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Log the server response

        // Remove the item from the UI
        item.remove();

        // Update the cart
        updateCart();
      })
      .catch((error) => {
        console.error('Error removing item:', error);
      });
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
        const key = btn
          .closest('.drawer-cart__item--cart-page')
          .getAttribute('data-key');
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

function removeItemFromCart(key) {
  axios
    .post('/cart/change.js', {
      id: key,
      quantity: 0,
    })
    .then(async (res) => {
      // Fetch the updated cart data
      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();

      // Update the cart item count in the UI
      updateCartItemCount(cartData.item_count);

      // If this was the last item, update the entire cart view
      if (cartData.items.length === 0) {
        updateCart();
      } else {
        // Otherwise just remove the specific item
        const itemElement = document.querySelector(
          `.drawer-cart__item--cart-page[data-key="${key}"]`
        );
        if (itemElement) {
          itemElement.remove();
        }
      }

      // Update the quantity value in the DrawerCart
      updateDrawerCartQuantity(key, 0);
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
      const format = document
        .querySelector('[data-money-format]')
        .getAttribute('data-money-format');
      const totalPrice = formatMoney(res.data.total_price, format);
      const item = res.data.items.find((item) => item.key === key);
      document.querySelector('#total-price').textContent = totalPrice;

      // Update the quantity value in the DrawerCart and in the current view
      // Use the actual quantity returned from Shopify (which may be limited by stock)
      const actualQuantity = item ? item.quantity : 0;
      updateDrawerCartQuantity(key, actualQuantity);
      inputElement.value = actualQuantity;

      // Find the item element
      const itemElement = document.querySelector(
        `.drawer-cart__item--cart-page[data-key="${key}"]`
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
            price = formatMoney(item.price, format);
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

      // Fetch the updated cart data
      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();

      // Update the cart item count in the UI
      updateCartItemCount(cartData.item_count);
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

const CartPage = () => {
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
            `.drawer-cart__item--cart-page[data-key="${item.key}"]`
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

export default CartPage;
