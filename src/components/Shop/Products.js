let url = window.location.href;
let variantIdUrl = null;
let match = url.match(/variant=([^&]*)/);
if (match) {
  variantIdUrl = match[1];
  // Remove trailing hash symbols from variantIdUrl
  variantIdUrl = variantIdUrl.replace(/#*$/, '');
} else {
  // Default behavior when no variant parameter is present
  // Select the first radio button
  const firstRadio = document.querySelector('input[type=radio][name=id]');
  if (firstRadio) {
    variantIdUrl = firstRadio.value;
    firstRadio.checked = true;
  }
}
const variantRadios = document.querySelectorAll('input[type=radio][name=id]');

const Products = () => {
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
    // Select the corresponding radio button
    if (variantIdUrl) {
      const selectedRadio = document.querySelector(`#variant-${variantIdUrl}`);
      if (selectedRadio) {
        selectedRadio.checked = true;
      }

      // Show the image related to the selected variant
      const selectedImage = document.querySelector(
        `img[data-variant-id="${variantIdUrl}"]`
      );
      if (selectedImage) {
        selectedImage.style.display = 'block';
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

        // Hide all images
        const images = document.querySelectorAll('.product-page__product-img');
        images.forEach((img) => {
          img.style.display = 'none';
        });

        // Show only the image related to the selected variant
        const selectedImage = document.querySelector(
          `img[data-variant-id="${variantId}"]`
        );
        if (selectedImage) {
          selectedImage.style.display = 'block';
        }

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

        console.log('After update:', params.toString()); // Debug line
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            {},
            '',
            url.origin + url.pathname + '?' + params.toString()
          );
        }
      });
    });
  }
};

export default Products;
