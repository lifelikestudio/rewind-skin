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

async function showVariantImages(variantId) {
  if (!variantId) {
    console.error('Variant ID is missing.');
    return;
  }

  const productHandle = window.location.pathname.split('/').pop();
  if (!productHandle) {
    console.error('Product handle is missing.');
    return;
  }

  try {
    const response = await fetch(`/products/${productHandle}.js`);
    const productData = await response.json();

    if (!productData || !productData.variants) {
      console.error('Product data is not available.');
      return;
    }

    const variant = productData.variants.find(
      (v) => v.id.toString() === variantId
    );
    if (!variant) {
      console.error('Selected variant not found.');
      return;
    }

    const sliderElement = document.getElementById('keen-slider');
    if (!sliderElement) {
      console.error('Slider element not found.');
      return;
    }

    sliderElement.innerHTML = ''; // Clear previous slides

    productData.images.forEach((image) => {
      if (
        image.includes('product-page') &&
        variant.options.some(
          (option) =>
            image.includes(`_${option}_`) || image.endsWith(`_${option}`)
        )
      ) {
        const slide = document.createElement('div');
        slide.className =
          'keen-slider__slide product-page__product-img-container';
        slide.style.display = 'block'; // Always show the slide as this function is called for the active variant

        const img = document.createElement('img');
        img.src = image.startsWith('//') ? 'https:' + image : image;
        img.alt = 'Product image';
        img.width = 893;
        img.loading = 'eager';
        img.className = 'product-page__product-img';

        slide.appendChild(img);
        sliderElement.appendChild(slide);
      }
    });

    // Reinitialize the slider after updating slides
    initializeSlider();
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

const initializeSlider = () => {
  if (window.slider) {
    window.slider.destroy();
  }
  const sliderElement = document.getElementById('keen-slider');
  if (sliderElement && sliderElement.children.length > 0) {
    window.slider = new KeenSlider('#keen-slider', {
      loop: true,
      slidesPerView: 1,
      spacing: 10,
    });
  } else {
    console.error('No slides to initialize the slider with.');
  }
};

let slider = null; // Holds the current slider instance

const Products = () => {
  // Determine and show images for the initial variant
  if (variantRadios.length === 0) {
    // If there are no radio buttons, assume the product has only one variant
    const singleVariantSection = document.querySelector('.variant-section');
    if (singleVariantSection) {
      singleVariantSection.style.display = 'flex';
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
  }

  // Add a change event listener to each radio button for variants with multiple images
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      const variantId = this.value;

      // Hide all variant-specific sections
      document.querySelectorAll('.variant-section').forEach((section) => {
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
    });
  });
};

export default Products;
