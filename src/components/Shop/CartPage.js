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

  // Update subscription information for items
  cartData.items.forEach((item) => {
    if (item.selling_plan_allocation) {
      // Find the item element in the cart page
      const itemElement = document.querySelector(
        `.drawer-cart__item--cart-page[data-key="${item.key}"]`
      );

      if (itemElement) {
        // Get or create a container for subscription info
        let subscriptionInfo = itemElement.querySelector(
          '.item__subscription-info'
        );
        if (!subscriptionInfo) {
          subscriptionInfo = document.createElement('div');
          subscriptionInfo.className = 'item__subscription-info';
          const itemInfoContainer = itemElement.querySelector(
            '.item__info--cart-page'
          );
          if (itemInfoContainer) {
            itemInfoContainer.appendChild(subscriptionInfo);
          }
        }

        // Display the selling plan name
        subscriptionInfo.textContent =
          item.selling_plan_allocation.selling_plan.name;
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
        } else if (value > 1) {
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

      // Remove the item from the UI
      const itemElement = document.querySelector(
        `.drawer-cart__item--cart-page[data-key="${key}"]`
      );
      if (itemElement) {
        itemElement.remove();
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
  axios
    .post('/cart/change.js', {
      id: key,
      quantity: quantity,
    })
    .then(async (res) => {
      if (res.status === 422) {
        throw new Error('The requested quantity is not in stock.');
      }
      const format = document
        .querySelector('[data-money-format]')
        .getAttribute('data-money-format');
      const totalPrice = formatMoney(res.data.total_price, format);
      const item = res.data.items.find((item) => item.key === key);
      document.querySelector('#total-price').textContent = totalPrice;

      // Update the quantity value in the DrawerCart
      updateDrawerCartQuantity(key, quantity);
      // Check if the quantity was updated as expected
      if (item.quantity !== quantity) {
        alert('The requested quantity is not in stock.');
      }

      // Check for selling plan and update UI if needed
      if (item && item.selling_plan_allocation) {
        const itemElement = document.querySelector(
          `.drawer-cart__item--cart-page[data-key="${key}"]`
        );
        if (itemElement) {
          const subscriptionInfo =
            itemElement.querySelector('.item__subscription-info') ||
            document.createElement('div');
          subscriptionInfo.className = 'item__subscription-info';
          subscriptionInfo.textContent =
            item.selling_plan_allocation.selling_plan.name;

          const itemInfoContainer = itemElement.querySelector(
            '.item__info--cart-page'
          );
          if (
            itemInfoContainer &&
            !itemElement.querySelector('.item__subscription-info')
          ) {
            itemInfoContainer.appendChild(subscriptionInfo);
          }
        }
      }

      // Fetch the updated cart data
      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();

      // Update the cart item count in the UI
      updateCartItemCount(cartData.item_count);
    })
    .catch((error) => {
      console.error('Error changing item quantity:', error);
      if (error.response && error.response.status === 422) {
        alert('The requested quantity is not in stock.');
        // Roll back the quantity to the previous value
        inputElement.value = previousValue;
      } else {
        alert(error.message);
      }
    });
}

const CartPage = () => {
  quantityHandler();
};

export default CartPage;
