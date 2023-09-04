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

function updateCartItemCount(count) {
  cartItemCount.forEach((el) => {
    el.textContent = `(${count})`;
  });
}

function removeItems() {
  const removeItemButtons = document.querySelectorAll('.item__remove');
  removeItemButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const variantId = btn.dataset.variantId;

      await fetch(`/cart/change.js`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
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

function updateQuantity() {
  // Update quantity with btns
  const quantityBtns = document.querySelectorAll('.cart__quantity button');
  quantityBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rootItem = btn.parentElement.parentElement.parentElement;
      const key = rootItem.getAttribute('data-line-item-key');
      const currentQuantity = Number(
        btn.parentElement.querySelector('input').value
      );
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

  updateQuantity();

  // Wait until the new HTML has been rendered
  setTimeout(() => {
    // Re-attach event listeners to remove buttons
    removeItems();
  }, 0);
}

export const attachEventListeners = () => {
  const addToCart = document.querySelectorAll('form[action="/cart/add"]');
  addToCart.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Submit form with AJAX
      await fetch('/cart/add', {
        method: 'post',
        body: new FormData(form),
      });

      // Get cart count
      const res = await fetch('/cart.js');
      const cartCount = await res.json();
      updateCartItemCount(cartCount.item_count);

      // Update cart without page reload
      await updateCart();
      // Open cart drawer
      openDrawer(drawerCart);
    });
  });
};

export const attachEventListenersToProduct = (productForm) => {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Submit form with AJAX
    await fetch('/cart/add', {
      method: 'post',
      body: new FormData(productForm),
    });

    // Get cart count
    const res = await fetch('/cart.js');
    const cartCount = await res.json();
    updateCartItemCount(cartCount.item_count);

    // Update cart without page reload
    await updateCart();
    // Open cart drawer
    openDrawer(drawerCart);
  });
};

const CartDrawer = () => {
  // Attach event listeners to remove buttons of items already in cart
  removeItems();

  addToCart.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Submit form with AJAX
      await fetch('/cart/add', {
        method: 'post',
        body: new FormData(form),
      });

      // Get cart count
      const res = await fetch('/cart.js');
      const cartCount = await res.json();
      updateCartItemCount(cartCount.item_count);

      // Update cart without page reload
      await updateCart();
      // Open cart drawer
      openDrawer(drawerCart);
    });
  });
  attachEventListeners();
  updateCartLinks();
  updateQuantity();
};

export default CartDrawer;
