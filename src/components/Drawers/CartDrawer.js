import { openDrawer, closeDrawer } from './DrawerHandlers';
import { drawerCart } from './Drawers.js';

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
    });
  });
}

function updateCartPageQuantity(key, quantity) {
  // Find the corresponding item in the CartPage
  const cartPageItem = document.querySelector(
    `.drawer-cart__item--cart-page[data-key="${key}"]`
  );

  // Update its quantity value
  if (cartPageItem) {
    const quantityInput = cartPageItem.querySelector('.cart__quantity input');
    if (quantityInput) {
      quantityInput.value = quantity;
    }
  }
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
      const res = await fetch('/cart/update.js', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: { [key]: newQuantity } }),
      });
      const json = await res.json();
      updateCart();
      updateCartPageQuantity(key, newQuantity);
      updateCartItemCount(json.item_count);
    });
  });
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

  // Check for subscription items and hide payment plans if needed
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cart) => {
      console.log('Drawer cart contents:', cart.items);

      // Enhanced check for subscriptions
      let hasSubscriptionItems = false;

      // Check each item separately for better debugging
      for (const item of cart.items) {
        console.log(
          `Drawer checking item ${item.key}:`,
          item.selling_plan_allocation
        );
        if (item.selling_plan_allocation) {
          hasSubscriptionItems = true;
          console.log('Drawer found subscription item:', item.key);
          break;
        }
      }

      // Find payment plan element
      const paymentPlanElement = document.querySelector(
        '.drawer-cart__footer .subtotal__payment-plan'
      );
      if (paymentPlanElement) {
        console.log(
          'Drawer payment plan element found, subscription items:',
          hasSubscriptionItems
        );

        // Show Sezzle ONLY if there are NO subscription items
        if (hasSubscriptionItems) {
          paymentPlanElement.style.display = 'none';
          console.log('Drawer hiding Sezzle payment plan');
        } else {
          paymentPlanElement.style.display = 'block';
          console.log('Drawer showing Sezzle payment plan');
        }
      } else {
        console.log('Drawer payment plan element not found');
      }
    })
    .catch((error) => {
      console.error('Error checking cart for subscriptions:', error);
      // If there's an error, don't change the visibility to avoid breaking the UI
    });

  updateQuantity();

  // Wait until the new HTML has been rendered
  setTimeout(() => {
    // Re-attach event listeners to remove buttons
    removeItems();
  }, 0);
}

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
