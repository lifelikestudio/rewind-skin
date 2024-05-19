import 'keen-slider/keen-slider.min.css';
import KeenSlider from 'keen-slider';

let url = window.location.href;
let variantIdUrl = null;
let match = url.match(/variant=([^&]*)/);
if (match) {
  variantIdUrl = match[1];
  variantIdUrl = variantIdUrl.replace(/#*$/, ''); // Remove trailing hash symbols
} else {
  const firstRadio = document.querySelector('input[type=radio][name=id]');
  if (firstRadio) {
    variantIdUrl = firstRadio.value;
    firstRadio.checked = true;
  }
}

const variantRadios = document.querySelectorAll('input[type=radio][name=id]');

const sliders = {}; // Object to store slider instances by variant ID

const initializeSlider = (variantId) => {
  const sliderContainer = document.querySelector(
    `.keen-slider[data-variant-id="${variantId}"]`
  );
  if (!sliderContainer) return;

  if (sliders[variantId]) {
    sliders[variantId].destroy();
    console.log(`Slider for variant ${variantId} destroyed`);
  }

  sliders[variantId] = new KeenSlider(sliderContainer, {
    loop: true,
    slides: sliderContainer.children.length,
    defaultAnimation: {
      duration: 3000,
    },
    created: () => {
      console.log(`Slider for variant ${variantId} created`);
    },
  });
};

const showVariantImages = (variantId) => {
  document
    .querySelectorAll('.product-page__product-img-container')
    .forEach((div) => {
      div.style.display = 'none';
    });

  const activeContainer = document.querySelector(
    `.product-page__product-img-container[data-variant-id="${variantId}"]`
  );
  if (activeContainer) {
    activeContainer.style.display = 'flex';
  }

  initializeSlider(variantId);
};

const Products = () => {
  if (variantRadios.length === 0) {
    const singleVariantSection = document.querySelector('.variant-section');
    if (singleVariantSection) {
      singleVariantSection.style.display = 'flex';
    }
  } else {
    showVariantImages(variantIdUrl);

    const selectedRadio = document.querySelector(`#variant-${variantIdUrl}`);
    if (selectedRadio) {
      selectedRadio.checked = true;
    }

    const selectedVariantSection = document.querySelector(
      `.variant-section-${variantIdUrl}`
    );
    if (selectedVariantSection) {
      selectedVariantSection.style.display = 'flex';
    }
  }

  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      const variantId = this.value;
      console.log('Variant changed to:', variantId);

      document.querySelectorAll('.variant-section').forEach((section) => {
        section.style.display = 'none';
      });

      const selectedVariantSection = document.querySelector(
        `.variant-section-${variantId}`
      );
      if (selectedVariantSection) {
        selectedVariantSection.style.display = 'flex';
      }

      showVariantImages(variantId);

      const quantityInput = document.querySelector(
        '.product-page__quantity-input'
      );
      if (quantityInput) {
        quantityInput.name = 'quantity-' + variantId;
      }

      let url = new URL(window.location.href);
      let params = new URLSearchParams(url.search + url.hash);
      params.set('variant', variantId);
      console.log('After update:', params.toString());
      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          {},
          '',
          `${url.origin}${url.pathname}?${params}`
        );
      }
    });
  });
};

export default Products;
