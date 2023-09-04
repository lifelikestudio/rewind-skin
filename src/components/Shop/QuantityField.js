let quantityInput = document.querySelector('.product-page__quantity-input');
let decrementButton = document.querySelector(
  '.product-page__quantity .quantity__decrement'
);
let incrementButton = document.querySelector(
  '.product-page__quantity .quantity__increment'
);

const QuantityField = () => {
  if (decrementButton) {
    decrementButton.addEventListener('click', function () {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });
  }
  if (incrementButton) {
    incrementButton.addEventListener('click', function () {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
  }
};

export default QuantityField;
