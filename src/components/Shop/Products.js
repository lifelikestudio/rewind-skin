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

const showVariantImages = (variantId) => {
  // Hide all parent divs of images
  document
    .querySelectorAll('.product-page__product-img-container')
    .forEach((div) => {
      div.style.display = 'none';
    });

  // Show all parent divs related to the selected variant
  document
    .querySelectorAll(`div[data-variant-id="${variantId}"]`)
    .forEach((div) => {
      div.style.display = 'flex';
    });
};

let slider = null; // Holds the current slider instance

const initializeSlider = () => {
  // Check if there's an existing slider instance and destroy it
  if (slider !== null) {
    slider.destroy();
  }

  // Select all slides within the slider container
  const allSlides = document.querySelectorAll('.keen-slider > *'); // Adjust the selector as needed

  // Filter slides to include only those that are visible
  const visibleSlidesCount = Array.from(allSlides).filter((slide) => {
    // Get the inline style for 'display' and check if it is not 'none'
    return slide.style.display !== 'none';
  }).length;

  // Initialize a new slider instance with the count of visible slides
  slider = new KeenSlider('.keen-slider', {
    loop: true,
    created: () => {
      console.log('Slider created');
    },
    slides: visibleSlidesCount > 0 ? visibleSlidesCount : 1, // Use visible slides count or fallback to a default
    // You can add more options here
  });
};

const Products = () => {
  // Call initializeSlider initially to setup the slider for the first time
  initializeSlider();
  // If there are no radio buttons, assume the product has only one variant
  if (variantRadios.length === 0) {
    const singleVariantSection = document.querySelector('.variant-section');
    if (singleVariantSection) {
      singleVariantSection.style.display = 'flex';
    }

    // Update the checkout button URL for single variant
    const loginToShopButton = document.querySelector(
      '.product-page__checkout-btn--icon.is--login'
    );
    if (loginToShopButton) {
      const url = new URL(loginToShopButton.href);

      // Get the current checkout_url value
      let checkoutUrl = url.searchParams.get('checkout_url');

      // Append the variant parameter to the checkout_url
      checkoutUrl = checkoutUrl + '?variant=' + variantIdUrl;

      // Manually construct the entire URL
      loginToShopButton.href =
        url.origin + url.pathname + '?checkout_url=' + checkoutUrl;
    }
  } else {
    // Initially show images for the variantIdUrl or the first variant
    showVariantImages(variantIdUrl);

    // Select the corresponding radio button if variantIdUrl is present
    if (variantIdUrl) {
      const selectedRadio = document.querySelector(`#variant-${variantIdUrl}`);
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
    }

    // Show the section related to the selected variant
    const selectedVariantSection = document.querySelector(
      `.variant-section-${variantIdUrl}`
    );
    if (selectedVariantSection) {
      selectedVariantSection.style.display = 'flex';
    }

    // Add a change event listener to each radio button
    variantRadios.forEach((radio) => {
      radio.addEventListener('change', function () {
        const variantId = this.value;

        // Hide all variant-specific sections
        const variantSections = document.querySelectorAll('.variant-section');
        variantSections.forEach((section) => {
          section.style.display = 'none';
        });

        // Show only the section related to the selected variant
        const selectedVariantSection = document.querySelector(
          `.variant-section-${variantId}`
        );
        if (selectedVariantSection) {
          selectedVariantSection.style.display = 'flex';
        }

        // Update UI for the selected variant
        showVariantImages(variantId);

        // Update the quantity field's name attribute to match the selected variant
        const quantityInput = document.querySelector(
          '.product-page__quantity-input'
        );
        if (quantityInput) {
          quantityInput.name = 'quantity-' + variantId;
        }

        // Update the URL's query string to reflect the selected variant
        let url = new URL(window.location.href);
        let params = url.search + url.hash; // Combine search and hash
        params = params.replace('?', ''); // Remove the first question mark
        params = new URLSearchParams(params); // Create a new URLSearchParams object

        // Get the _ss parameter's value
        let ssValue = params.get('_ss');
        if (ssValue) {
          // Use a regular expression to replace the variant parameter
          ssValue = ssValue.replace(/variant=[^&]*/, 'variant=' + variantId);

          // Update the _ss parameter's value
          params.set('_ss', ssValue);
        }

        // Check for a top-level variant parameter
        if (params.has('variant')) {
          params.set('variant', variantId);
        }

        console.log('After update:', params.toString()); // Debug
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            {},
            '',
            url.origin + url.pathname + '?' + params.toString()
          );
        }

        // After updating the UI, re-initialize the slider for the new variant images
        initializeSlider();
      });
    });
  }
};

export default Products;
