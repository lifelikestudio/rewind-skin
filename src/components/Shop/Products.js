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
    // Update the URL to include the default variant ID
    updateUrlWithVariant(variantIdUrl);
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

    if (!productData || !productData.variants || !productData.media) {
      console.error('Product data is not available or media array is missing.');
      return;
    }

    const variant = productData.variants.find(
      (v) => v.id.toString() === variantId
    );
    if (!variant) {
      console.error('Selected variant not found.');
      return;
    }

    // Create an array of normalized option values
    const normalizedOptions = variant.options.map(normalizeOption);

    const sliderElement = document.getElementById('keen-slider');
    if (!sliderElement) {
      console.error('Slider element not found.');
      return;
    }

    sliderElement.innerHTML = ''; // Clear previous slides
    let isFirstImage = true; // Flag to track the first image
    productData.media.forEach((mediaItem) => {
      if (
        mediaItem.src.includes('product-page') &&
        normalizedOptions.every((option) => {
          // Split the filename by underscores and check for an exact match
          return mediaItem.src
            .split('_')
            .some((part) => normalizeOption(part) === option);
        })
      ) {
        const slide = document.createElement('div');
        slide.className =
          'keen-slider__slide product-page__product-img-container';
        slide.style.display = 'block'; // Always show the slide as this function is called for the active variant

        const img = document.createElement('img');
        img.src = mediaItem.src;
        img.alt = mediaItem.alt || 'product image';
        img.width = 893;
        img.loading = isFirstImage ? 'eager' : 'lazy'; // Set loading attribute based on whether it's the first image
        img.className = 'product-page__product-img';

        slide.appendChild(img);
        sliderElement.appendChild(slide);

        isFirstImage = false; // Set to false after the first image
      }
    });

    // Reinitialize the slider after updating slides
    initializeSlider();
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

function normalizeOption(option) {
  // If the option starts with a dollar sign, remove it
  if (option.startsWith('$')) {
    option = option.slice(1);
  }

  return option
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/gi, '-') // Replace all non-alphanumeric characters (including spaces) with a single dash
    .toLowerCase() // Convert to lower case
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing dashes
}

function navigation(slider) {
  let wrapper, dots;

  function markup(remove) {
    wrapperMarkup(remove);
    dotMarkup(remove);
  }

  function removeElement(element) {
    element.parentNode.removeChild(element);
  }

  function createDiv(className) {
    var div = document.createElement('div');
    var classNames = className.split(' ');
    classNames.forEach((name) => div.classList.add(name));
    return div;
  }

  function wrapperMarkup(remove) {
    if (remove) {
      var parent = wrapper.parentNode;
      while (wrapper.firstChild)
        parent.insertBefore(wrapper.firstChild, wrapper);
      removeElement(wrapper);
      return;
    }
    wrapper = createDiv('product-page__slider-nav-container');
    slider.container.parentNode.appendChild(wrapper);
    wrapper.appendChild(slider.container);
  }

  function dotMarkup(remove) {
    if (remove) {
      removeElement(dots);
      return;
    }
    dots = createDiv('dots');
    slider.track.details.slides.forEach((_e, idx) => {
      var dot = createDiv('dot');
      dot.addEventListener('click', () => slider.moveToIdx(idx));
      dots.appendChild(dot);
    });
    wrapper.appendChild(dots);
  }

  function updateClasses() {
    var slide = slider.track.details.rel;
    Array.from(dots.children).forEach(function (dot, idx) {
      idx === slide
        ? dot.classList.add('dot--active')
        : dot.classList.remove('dot--active');
    });
  }

  slider.on('created', () => {
    markup();
    updateClasses();
  });
  slider.on('optionsChanged', () => {
    markup(true);
    markup();
    updateClasses();
  });
  slider.on('slideChanged', () => {
    updateClasses();
  });
  slider.on('destroyed', () => {
    markup(true);
  });
}

const initializeSlider = () => {
  if (window.slider) {
    window.slider.destroy();
  }
  const sliderElement = document.getElementById('keen-slider');
  if (sliderElement && sliderElement.children.length > 0) {
    const plugins = sliderElement.children.length > 1 ? [navigation] : []; // Only include navigation if more than one slide
    window.slider = new KeenSlider(
      '#keen-slider',
      {
        loop: true,
        slidesPerView: 1,
        spacing: 10,
        defaultAnimation: {
          duration: 3000,
        },
        detailsChanged: (s) => {
          s.slides.forEach((element, idx) => {
            element.style.opacity = s.track.details.slides[idx].portion;
          });
        },
        renderMode: 'custom',
      },
      plugins // Use the conditional plugins array
    );
  } else {
    console.error('No slides to initialize the slider with.');
  }
};

let slider = null; // Holds the current slider instance

const Products = () => {
  // Handle variant selection
  const handleVariantSelection = (variantId) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Update or add the variant parameter
    params.set('variant', variantId);

    // Special handling for _ss parameter if it exists
    const ssValue = params.get('_ss');
    if (ssValue) {
      try {
        const ssParams = new URLSearchParams(ssValue);
        ssParams.set('variant', variantId);
        params.set('_ss', ssParams.toString());
      } catch (error) {
        console.error('Error updating _ss parameter:', error);
      }
    }

    const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;

    // Update the URL without reloading the page
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Attach event listeners to variant radios
  const variantRadios = document.querySelectorAll('input[type=radio][name=id]');
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      handleVariantSelection(this.value);
    });
  });

  // Robust check for product page
  const isProductPage = () => {
    // Check URL path
    const isProductPath = window.location.pathname.includes('/products/');

    // Check for product-specific elements
    const hasProductForm = !!document.querySelector('form[action="/cart/add"]');
    const hasVariantRadios = !!document.querySelectorAll(
      'input[type=radio][name=id]'
    ).length;
    const hasProductImages = !!document.getElementById('keen-slider');

    // Check for product JSON
    const hasProductJSON = !!document.getElementById(
      'ProductJson-product-template'
    );

    // Combine all checks
    return (
      isProductPath &&
      (hasProductForm || hasVariantRadios || hasProductImages || hasProductJSON)
    );
  };

  // Exit early if not on a product page
  if (!isProductPage()) {
    console.log('Not a product page, exiting Products component.');
    return;
  }

  // Determine and show images for the initial variant
  if (variantRadios.length === 0) {
    // If there are no radio buttons, assume the product has only one variant
    const singleVariantSection = document.querySelector('.variant-section');
    if (singleVariantSection) {
      singleVariantSection.style.display = 'flex';
    }
    // Get the variant ID from the product form
    const productForm = document.querySelector('form[action="/cart/add"]');
    if (productForm) {
      const variantInput = productForm.querySelector('input[name="id"]');
      if (variantInput) {
        variantIdUrl = variantInput.value;
        showVariantImages(variantIdUrl);
      }
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

      // Store all existing parameters
      let url = new URL(window.location.href);
      let params = new URLSearchParams(url.search);
      let existingParams = {};
      for (let [key, value] of params.entries()) {
        if (key !== 'variant') {
          existingParams[key] = value;
        }
      }

      // Clear all parameters and re-add them (except variant)
      params = new URLSearchParams();
      for (let [key, value] of Object.entries(existingParams)) {
        params.set(key, value);
      }

      // Add the new variant parameter
      params.set('variant', variantId);

      // Special handling for _ss parameter
      if (existingParams['_ss']) {
        let ssParams = new URLSearchParams(existingParams['_ss']);
        ssParams.set('variant', variantId);
        params.set('_ss', ssParams.toString());
      }

      // Construct the new URL
      let newUrl = `${url.origin}${url.pathname}?${params.toString()}${
        url.hash
      }`;

      // Update the URL without reloading the page
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', newUrl);
      }
    });
  });
};

export default Products;
