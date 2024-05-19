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
  document
    .querySelectorAll('.product-page__product-img-container')
    .forEach((div, index) => {
      div.style.display = 'none';
      div.querySelectorAll('.keen-slider > *').forEach((slide, slideIndex) => {
        slide.style.opacity = 0;
        console.log(`Div ${index}, Slide ${slideIndex} set to opacity 0`);
      });
    });

  document
    .querySelectorAll(`div[data-variant-id="${variantId}"]`)
    .forEach((div, index) => {
      div.style.display = 'flex';
      requestAnimationFrame(() => {
        div
          .querySelectorAll('.keen-slider > *')
          .forEach((slide, slideIndex) => {
            slide.style.opacity = 1;
            console.log(`Div ${index}, Slide ${slideIndex} set to opacity 1`);
          });
      });
    });
};

function navigation(slider) {
  let wrapper, dots;

  function markup(remove) {
    wrapperMarkup(remove);
    dotMarkup(remove);
  }

  function removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
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

let slider = null; // Holds the current slider instance

const initializeSlider = () => {
  if (slider !== null && typeof slider.destroy === 'function') {
    slider.destroy();
    console.log('Slider destroyed');
  }

  // Select only slides that are visible and belong to the active variant
  const activeVariantDiv = document.querySelector(
    `div[data-variant-id="${variantIdUrl}"]`
  );
  const allSlides = activeVariantDiv
    ? activeVariantDiv.querySelectorAll('.keen-slider > *')
    : [];

  console.log('All slides count:', allSlides.length);

  if (allSlides.length <= 1) {
    allSlides.forEach((slide) => {
      slide.style.opacity = 1;
    });
    console.log('Not enough slides to initialize slider');
    return;
  }

  slider = new KeenSlider(
    activeVariantDiv.querySelector('.keen-slider'),
    {
      loop: true,
      created: () => {
        console.log('Slider created');
      },
      slides: allSlides.length,
      defaultAnimation: {
        duration: 3000,
      },
      detailsChanged: (s) => {
        s.slides.forEach((element, idx) => {
          const slideDetail = s.track.details.slides[idx];
          if (slideDetail) {
            element.style.opacity = slideDetail.portion.toString();
          }
        });
      },
      renderMode: 'custom',
    },
    [navigation]
  );
};

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
  initializeSlider();

  // Add a change event listener to each radio button for variants with multiple images
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      const variantId = this.value;
      console.log('Variant changed to:', variantId);

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

      // Update the slider to show only images from the active variant
      variantIdUrl = variantId; // Update the global variantIdUrl to the new variant
      initializeSlider(); // Re-initialize the slider with the new variant's images
    });
  });
};

export default Products;
