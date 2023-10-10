let quantityInputs = document.querySelectorAll('.product-page__quantity-input');
let decrementButtons = document.querySelectorAll(
  '.product-page__quantity .quantity__decrement'
);
let incrementButtons = document.querySelectorAll(
  '.product-page__quantity .quantity__increment'
);

const QuantityField = () => {
  decrementButtons.forEach((decrementButton, index) => {
    decrementButton.addEventListener('click', function () {
      if (quantityInputs[index].value > 1) {
        quantityInputs[index].value = parseInt(quantityInputs[index].value) - 1;
      }
    });
  });

  incrementButtons.forEach((incrementButton, index) => {
    incrementButton.addEventListener('click', function () {
      quantityInputs[index].value = parseInt(quantityInputs[index].value) + 1;
    });
  });
};

export default QuantityField;
