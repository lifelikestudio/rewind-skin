import 'keen-slider/keen-slider.min.css';
import KeenSlider from 'keen-slider';

let url = window.location.href;
let variantIdUrl = null;
let match = url.match(/variant=([^&]*)/);

// Define the updateUrlWithVariant function
function updateUrlWithVariant(variantId) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.set('variant', variantId);
  const newUrl = `${url.origin}${url.pathname}?${params.toString()}${url.hash}`;
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, '', newUrl);
  }
}

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
  // Add loading state when starting to load images
  addLoadingState();

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

function addLoadingState() {
  // First, remove any existing loading overlays
  const existingOverlays = document.querySelectorAll('.product-image-loading');
  existingOverlays.forEach((overlay) => overlay.remove());

  const sliderElement = document.getElementById('keen-slider');
  if (!sliderElement) return;

  // Set position relative on parent if not already
  sliderElement.parentNode.style.position = 'relative';

  // Add loading overlay with custom loader
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'product-image-loading';

  // Create the blob loader element
  const loader = document.createElement('div');
  loader.className = 'loader';
  loadingOverlay.appendChild(loader);

  // Add a visually hidden loading text for accessibility
  const srText = document.createElement('span');
  srText.className = 'sr-only';
  srText.textContent = 'Loading product images...';
  loadingOverlay.appendChild(srText);

  sliderElement.parentNode.insertBefore(loadingOverlay, sliderElement);

  // Hide loading when images are loaded
  const hideLoading = () => {
    const loadingEl = document.querySelector('.product-image-loading');
    if (loadingEl) {
      loadingEl.classList.add('fade-out');
      setTimeout(() => loadingEl.remove(), 500);
    }
  };

  // Track image loading
  setTimeout(() => {
    const images = sliderElement.querySelectorAll('img');
    const totalImages = images.length;

    if (totalImages === 0) {
      hideLoading();
      return;
    }

    let imagesLoaded = 0;

    images.forEach((img) => {
      if (img.complete) {
        imagesLoaded++;
        if (imagesLoaded === totalImages) hideLoading();
      } else {
        img.addEventListener('load', () => {
          imagesLoaded++;
          if (imagesLoaded === totalImages) hideLoading();
        });
        img.addEventListener('error', () => {
          imagesLoaded++;
          if (imagesLoaded === totalImages) hideLoading();
        });
      }
    });
  }, 100);

  // Fallback - hide loading after a reasonable time
  setTimeout(hideLoading, 5000);
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
    let params = new URLSearchParams(url.search);

    // Handle the _ss parameter separately
    let ssValue = params.get('_ss');
    if (ssValue) {
      let ssParams = new URLSearchParams(ssValue);
      ssParams.set('variant', variantId);
      params.set('_ss', ssParams.toString());
    }

    // Update the main variant parameter
    params.set('variant', variantId);

    // Construct the new URL
    const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;

    // Update the URL without reloading the page
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Function to hide/show Sezzle payment plan based on subscription selection
  const togglePaymentPlan = (isSubscription) => {
    const paymentPlans = document.querySelectorAll(
      '.product-page__payment-plan'
    );
    paymentPlans.forEach((plan) => {
      plan.style.display = isSubscription ? 'none' : 'block';
    });
  };

  // Attach event listeners to variant radios
  const variantRadios = document.querySelectorAll('input[type=radio][name=id]');
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      const variantId = this.value;
      handleVariantSelection(variantId);

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

        // Check if the selected variant is out of stock
        const isOutOfStock = selectedVariantSection.classList.contains(
          'product-page__sold-out-group'
        );

        // Hide or show the Subi widget based on stock availability
        const subiWidget = document.getElementById('subi-widget-wrapper');
        const subifyWidget = document.getElementById('subify-widget-wrapper');

        if (subiWidget) {
          subiWidget.style.display = isOutOfStock ? 'none' : 'block';
        }

        if (subifyWidget) {
          subifyWidget.style.display = isOutOfStock ? 'none' : 'block';
        }
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
    // console.log('Not a product page, exiting Products component.');
    return;
  }

  // Set up Subify integration
  const setupSubifyListeners = () => {
    // Listen for Subify SDK loaded event
    window.addEventListener('subify:sdkLoaded', function () {
      // Once SDK is loaded, we can check for the initial selling plan state
      const sellingPlanInput = document.querySelector(
        'input[name="selling_plan"]'
      );
      const isSubscription = sellingPlanInput && sellingPlanInput.value;
      togglePaymentPlan(isSubscription);
    });

    // Listen for Subify selling plan change event
    window.addEventListener('subify:sellingPlanChange', function (event) {
      const { selectedSellingPlan } = event.detail;
      const isSubscription = selectedSellingPlan && selectedSellingPlan.id;
      togglePaymentPlan(isSubscription);
    });

    // Initialize Subify functionality
    initializeSubify();
  };

  // Set up listeners when DOM is loaded
  document.addEventListener('DOMContentLoaded', setupSubifyListeners);

  // Also call the setup immediately in case DOMContentLoaded has already fired
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setupSubifyListeners();
  }

  // Determine and show images for the initial variant
  if (variantRadios.length === 0) {
    // If there are no radio buttons, assume the product has only one variant
    const singleVariantSection = document.querySelector('.variant-section');
    if (singleVariantSection) {
      singleVariantSection.style.display = 'flex';

      // Check if the single variant is out of stock
      const isOutOfStock = singleVariantSection.classList.contains(
        'product-page__sold-out-group'
      );

      // Hide or show the Subi widget based on stock availability
      const subiWidget = document.getElementById('subi-widget-wrapper');
      const subifyWidget = document.getElementById('subify-widget-wrapper');

      if (subiWidget) {
        subiWidget.style.display = isOutOfStock ? 'none' : 'block';
      }

      if (subifyWidget) {
        subifyWidget.style.display = isOutOfStock ? 'none' : 'block';
      }
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

      // Check if the initially selected variant is out of stock
      const isOutOfStock = selectedVariantSection.classList.contains(
        'product-page__sold-out-group'
      );

      // Hide or show the Subi widget based on stock availability
      const subiWidget = document.getElementById('subi-widget-wrapper');
      const subifyWidget = document.getElementById('subify-widget-wrapper');

      if (subiWidget) {
        subiWidget.style.display = isOutOfStock ? 'none' : 'block';
      }

      if (subifyWidget) {
        subifyWidget.style.display = isOutOfStock ? 'none' : 'block';
      }
    }
  }
};

// Add this function to handle Subify integration
function initializeSubify() {
  // console.log('🔍 Starting Subify initialization check');
  const hasSubiPlans = document.getElementById('selling-plan-data') !== null;

  // console.log('✅ Subify selling plans detected:', hasSubiPlans);

  if (!hasSubiPlans) {
    // console.log('❌ No Subify plans found, skipping initialization');
    return;
  }

  let isWidgetInitialized = false;

  // Get selling plan data from pre-rendered JSON
  try {
    const sellingPlanData = JSON.parse(
      document.getElementById('selling-plan-data').textContent
    );

    // Format money with currency using Shopify's format
    function formatMoney(cents) {
      if (typeof cents == 'string') cents = cents.replace('.', '');
      cents = parseInt(cents);
      const format = sellingPlanData.money_format;

      function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = precision || 2;
        thousands = thousands || ',';
        decimal = decimal || '.';
        if (isNaN(number) || number == null) return '0';
        number = (number / 100.0).toFixed(precision);
        if (parseFloat(number) === parseInt(number)) {
          number = parseInt(number);
        }
        let parts = String(number).split('.');
        const dollars = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          '$1' + thousands
        );
        const cents = parts.length > 1 ? decimal + parts[1] : '';
        return dollars + cents;
      }

      const formatted = formatWithDelimiters(cents);
      return format.replace(/\{\{\s*amount\s*\}\}/, formatted);
    }

    // Get selling plan price from pre-rendered data
    function getSellingPlanPrice(variantId, sellingPlanId) {
      const variant = sellingPlanData.variants.find(
        (v) => v.id === parseInt(variantId)
      );
      if (!variant) {
        // console.log('Variant not found in selling plan data:', variantId);
        return null;
      }

      if (!sellingPlanId) {
        return {
          price: variant.price,
          compare_at_price: variant.compare_at_price,
        };
      }

      const allocation = variant.selling_plan_allocations.find((a) => {
        if (a.selling_plan_id === sellingPlanId.toString()) return true;
        if (parseInt(a.selling_plan_id) === parseInt(sellingPlanId))
          return true;
        return false;
      });

      if (!allocation) {
        // console.log(
        //   'Allocation not found for selling plan in pre-rendered data'
        // );

        // Fallback to calculating price from selling plan groups
        const sellingPlanGroups = sellingPlanData.selling_plan_groups || [];
        let selectedPlan = null;

        for (const group of sellingPlanGroups) {
          if (!group.selling_plans) continue;

          for (const plan of group.selling_plans) {
            if (
              plan.id.toString() === sellingPlanId.toString() ||
              parseInt(plan.id) === parseInt(sellingPlanId)
            ) {
              selectedPlan = plan;
              break;
            }
          }
          if (selectedPlan) break;
        }

        if (
          selectedPlan &&
          selectedPlan.price_adjustments &&
          selectedPlan.price_adjustments.length > 0
        ) {
          const priceAdjust = selectedPlan.price_adjustments[0];
          let adjustedPrice;

          if (priceAdjust.value_type === 'percentage') {
            adjustedPrice = variant.price * (1 - priceAdjust.value / 100);
          } else if (priceAdjust.value_type === 'fixed_amount') {
            adjustedPrice = variant.price - priceAdjust.value;
          } else if (priceAdjust.value_type === 'price') {
            adjustedPrice = priceAdjust.value;
          } else {
            adjustedPrice = variant.price;
          }

          return {
            price: Math.round(adjustedPrice),
            compare_at_price: variant.compare_at_price,
          };
        }

        return {
          price: variant.price,
          compare_at_price: variant.compare_at_price,
        };
      }

      return {
        price: allocation.price,
        compare_at_price:
          allocation.compare_at_price || variant.compare_at_price,
      };
    }

    // Update button price based on selected selling plan
    function updateButtonPrice(sellingPlanId, formattedPlanName) {
      const selectedVariantInput =
        document.querySelector('input[name="id"]:checked') ||
        document.querySelector('input[name="id"]');
      if (!selectedVariantInput) {
        // console.log('No variant selected');
        return;
      }

      const variantId = parseInt(selectedVariantInput.value);

      const pricingData = getSellingPlanPrice(variantId, sellingPlanId);
      if (!pricingData) {
        // console.log('Pricing data not found');
        return;
      }

      const variantSection = document.querySelector(
        `.variant-section-${variantId}`
      );
      if (!variantSection) {
        // console.log('Variant section not found');
        return;
      }

      const checkoutButton = variantSection.querySelector(
        '.product-page__checkout-btn'
      );
      const priceSpan = checkoutButton.querySelector('span:last-child');

      if (!priceSpan) {
        // console.log('Price span not found');
        return;
      }

      const formattedPrice = formatMoney(pricingData.price);

      if (
        pricingData.compare_at_price &&
        pricingData.compare_at_price > pricingData.price
      ) {
        const formattedComparePrice = formatMoney(pricingData.compare_at_price);
        if (formattedPlanName && sellingPlanId) {
          priceSpan.innerHTML = `
            <del>${formattedComparePrice}</del>
            <ins>${formattedPrice}${formattedPlanName}</ins>
          `;
        } else {
          priceSpan.innerHTML = `
            <del>${formattedComparePrice}</del>
            <ins>${formattedPrice}</ins>
          `;
        }
      } else if (formattedPlanName && sellingPlanId) {
        priceSpan.innerHTML = `${formattedPrice}${formattedPlanName}`;
      } else {
        priceSpan.textContent = formattedPrice;
      }

      // Update Sezzle payments
      const paymentPlanElement = variantSection.querySelector(
        '.product-page__payment-plan'
      );
      if (paymentPlanElement) {
        const dividedPrice = Math.round(pricingData.price / 4);
        const formattedDividedPrice = formatMoney(dividedPrice);
        paymentPlanElement.innerHTML = `or 4 interest-free payments of ${formattedDividedPrice} with <span class="is--emphasized">Sezzle</span>`;
      }
    }

    // Initialize or re-initialize the widget
    function initSubifyWidget() {
      // console.log('🔄 Initializing Subify widget');
      if (!window.subifySdk) {
        // console.log('❌ Subify SDK not available yet');
        return;
      }

      const selectedVariantInput =
        document.querySelector('input[name="id"]:checked') ||
        document.querySelector('input[name="id"]');
      const variantId = selectedVariantInput
        ? parseInt(selectedVariantInput.value)
        : null;

      if (!variantId) return;

      try {
        window.subifySdk
          .renderWidget(
            JSON.parse(
              document.getElementById('ProductJson-product-template')
                ?.textContent || '{}'
            ),
            {
              renderPosition: {
                wrapper: '#subify-widget-wrapper',
                position: 'APPEND',
              },
              sellingPlanInput: {
                wrapper: 'form.product-page__checkout-form',
                id: 'selling-plan-input',
              },
              useCardApi: true,
            }
          )
          .then(() => {
            isWidgetInitialized = true;
            // console.log('✅ Subify widget initialized successfully');
            // console.log('🔄 Setting up Subify cart integration');
            // Setup cart integration
            setupCartIntegration();
          })
          .catch((error) => {
            console.error('Error initializing Subify widget:', error);
          });
      } catch (error) {
        console.error('Error during Subify initialization:', error);
      }
    }

    // Set up event listeners for selling plan changes
    function setupCartIntegration() {
      // console.log('🔄 Adding Subify selling plan change listener');
      window.addEventListener('subify:sellingPlanChange', function (event) {
        const { selectedSellingPlan } = event.detail;
        // console.log('🔄 Subify plan changed:', selectedSellingPlan);

        const selectedVariantInput =
          document.querySelector('input[name="id"]:checked') ||
          document.querySelector('input[name="id"]');
        const variantId = selectedVariantInput
          ? selectedVariantInput.value
          : null;

        const buttonTextElement = document.getElementById(
          `add-to-cart-text-${variantId}`
        );

        if (buttonTextElement) {
          if (selectedSellingPlan && selectedSellingPlan.id) {
            buttonTextElement.textContent = 'Subscribe';
          } else {
            buttonTextElement.textContent = 'Add to Bag';
          }
        }

        let formattedPlanName = '';

        const sellingPlanId =
          selectedSellingPlan && selectedSellingPlan.id
            ? selectedSellingPlan.id
            : selectedSellingPlan;
        updateButtonPrice(sellingPlanId, formattedPlanName);

        // Update payment plan visibility
        const paymentPlans = document.querySelectorAll(
          '.product-page__payment-plan'
        );
        const isSubscription = selectedSellingPlan && selectedSellingPlan.id;
        paymentPlans.forEach((plan) => {
          plan.style.display = isSubscription ? 'none' : 'block';
        });

        // console.log('✅ Button price updated for selling plan:', sellingPlanId);
      });
    }

    // Update the variant in the widget
    function updateSubifyVariant() {
      // console.log('🔄 Updating Subify variant');
      if (!window.subifySdk || !isWidgetInitialized) {
        // console.log('❌ Subify not ready for variant update');
        return;
      }

      const selectedVariantInput =
        document.querySelector('input[name="id"]:checked') ||
        document.querySelector('input[name="id"]');
      const variantId = selectedVariantInput
        ? parseInt(selectedVariantInput.value)
        : null;

      if (variantId && typeof window.subifySdk.changeVariant === 'function') {
        // console.log('🔄 Calling Subify changeVariant with:', variantId);
        window.subifySdk.changeVariant(
          JSON.parse(
            document.getElementById('ProductJson-product-template')
              ?.textContent || '{}'
          ).id,
          variantId
        );
        // console.log('Subify variant updated to:', variantId);
      }
    }

    // Initialize when SDK is loaded
    if (window.subifySdk) {
      initSubifyWidget();
    } else {
      window.addEventListener('subify:sdkLoaded', initSubifyWidget);
    }

    // Add change listeners to variant selectors
    document.querySelectorAll('input[name="id"]').forEach((input) => {
      input.addEventListener('change', function () {
        updateSubifyVariant();

        const sellingPlanInput = document.querySelector(
          'input[name="selling_plan"]'
        );
        if (sellingPlanInput && sellingPlanInput.value) {
          updateButtonPrice(sellingPlanInput.value);
        } else {
          updateButtonPrice(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in Subify initialization:', error);
  }

  // At the end of the initialization
  // console.log('✅ Subify integration setup complete');
}

export default Products;
