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

    // Dynamically log all options
    Object.keys(variant).forEach((key) => {
      if (key.startsWith('option') && variant[key]) {
        console.log(`${key}:`, variant[key]);
      }
    });

    const sliderElement = document.getElementById('keen-slider');
    if (!sliderElement) {
      console.error('Slider element not found.');
      return;
    }

    sliderElement.innerHTML = ''; // Clear previous slides

    productData.variants.forEach((variant) => {
      if (variant.id.toString() === variantId) {
        const variantImage = variant.featured_image || productData.images[0]; // Use the variant's featured image or the first product image as a fallback

        const slide = document.createElement('div');
        slide.className =
          'keen-slider__slide product-page__product-img-container';
        slide.setAttribute('data-variant-id', variant.id);
        slide.style.display = 'block'; // Always show the slide as this function is called for the active variant

        const img = document.createElement('img');
        img.src = variantImage.src;
        img.alt = variantImage.alt || 'Variant image';
        img.width = 893; // Set width as specified
        img.loading = 'eager';
        img.className = 'product-page__product-img';
        img.setAttribute('data-variant-id', variant.id);

        slide.appendChild(img);
        sliderElement.appendChild(slide);
      }
    });

    if (window.KeenSlider) {
      initializeSlider();
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

// function navigation(slider) {
//   let wrapper, dots;

//   function markup(remove) {
//     wrapperMarkup(remove);
//     dotMarkup(remove);
//   }

//   function removeElement(element) {
//     if (element && element.parentNode) {
//       element.parentNode.removeChild(element);
//     }
//   }

//   function createDiv(className) {
//     var div = document.createElement('div');
//     var classNames = className.split(' ');
//     classNames.forEach((name) => div.classList.add(name));
//     return div;
//   }

//   function wrapperMarkup(remove) {
//     if (remove) {
//       var parent = wrapper.parentNode;
//       while (wrapper.firstChild)
//         parent.insertBefore(wrapper.firstChild, wrapper);
//       removeElement(wrapper);
//       return;
//     }
//     wrapper = createDiv('product-page__slider-nav-container');
//     slider.container.parentNode.appendChild(wrapper);
//     wrapper.appendChild(slider.container);
//   }

//   function dotMarkup(remove) {
//     if (remove) {
//       removeElement(dots);
//       return;
//     }
//     dots = createDiv('dots');
//     slider.track.details.slides.forEach((_e, idx) => {
//       var dot = createDiv('dot');
//       dot.addEventListener('click', () => slider.moveToIdx(idx));
//       dots.appendChild(dot);
//     });
//     wrapper.appendChild(dots);
//   }

//   function updateClasses() {
//     var slide = slider.track.details.rel;
//     Array.from(dots.children).forEach(function (dot, idx) {
//       idx === slide
//         ? dot.classList.add('dot--active')
//         : dot.classList.remove('dot--active');
//     });
//   }

//   slider.on('created', () => {
//     markup();
//     updateClasses();
//   });
//   slider.on('optionsChanged', () => {
//     markup(true);
//     markup();
//     updateClasses();
//   });
//   slider.on('slideChanged', () => {
//     updateClasses();
//   });
//   slider.on('destroyed', () => {
//     markup(true);
//   });
// }

// let slider = null; // Holds the current slider instance

// const initializeSlider = () => {
//   if (slider !== null && typeof slider.destroy === 'function') {
//     slider.destroy();
//     slider = null;
//   }

//   // Ensure all intended slides are visible
//   const allSlides = document.querySelectorAll('.keen-slider > *');
//   const visibleSlides = Array.from(allSlides).filter(
//     (slide) => slide.parentNode.style.display !== 'none'
//   );

//   if (visibleSlides.length <= 1) {
//     visibleSlides.forEach((slide) => {
//       slide.style.opacity = 1;
//     });
//     return;
//   }

//   slider = new KeenSlider(
//     '.keen-slider',
//     {
//       loop: true,
//       slides: visibleSlides.length,
//       defaultAnimation: {
//         duration: 3000,
//       },
//       detailsChanged: (s) => {
//         s.slides.forEach((element, idx) => {
//           const slideDetail = s.track.details.slides[idx];
//           if (slideDetail) {
//             element.style.opacity = slideDetail.portion.toString();
//           }
//         });
//       },
//       renderMode: 'custom',
//     },
//     [navigation]
//   );
// };

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

  // Call initializeSlider after setting up the initial variant display
  // This ensures the slider is only initialized if necessary based on the visible images
  // initializeSlider();

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

      // After updating the UI for the selected variant, re-initialize the slider
      // initializeSlider();
    });
  });
};

export default Products;
