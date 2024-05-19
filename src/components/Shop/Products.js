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
let slider = null; // Holds the current slider instance

function navigation(slider) {
  let wrapper, dots;

  function createDiv(className) {
    var div = document.createElement('div');
    div.className = className;
    return div;
  }

  function setupNavigation() {
    wrapper = createDiv('slider-navigation');
    slider.container.parentNode.insertBefore(
      wrapper,
      slider.container.nextSibling
    );
    dots = createDiv('dots');
    wrapper.appendChild(dots);
    slider.track.details.slides.forEach((_e, idx) => {
      var dot = createDiv('dot');
      dot.addEventListener('click', () => slider.moveToIdx(idx));
      dots.appendChild(dot);
    });
    updateClasses();
  }

  function updateClasses() {
    var slide = slider.track.details.rel;
    Array.from(dots.children).forEach((dot, idx) => {
      dot.className = idx === slide ? 'dot active' : 'dot';
    });
  }

  slider.on('created', setupNavigation);
  slider.on('slideChanged', updateClasses);
}

const initializeSlider = (variantId) => {
  const sliderContainer = document.querySelector(
    `.keen-slider[data-variant-id="${variantId}"]`
  );
  if (!sliderContainer) return;

  if (slider) {
    slider.destroy();
    console.log('Slider destroyed');
  }

  slider = new KeenSlider(
    sliderContainer,
    {
      loop: true,
      slides: sliderContainer.children.length,
      defaultAnimation: {
        duration: 3000,
      },
      created: () => {
        console.log(`Slider for variant ${variantId} created`);
      },
    },
    [navigation]
  ); // Include navigation in the slider initialization
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
  // Initially show images for the variantIdUrl or the first variant
  showVariantImages(variantIdUrl);

  // Add a change event listener to each radio button for variants
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      const variantId = this.value;
      console.log('Variant changed to:', variantId);

      showVariantImages(variantId);
    });
  });
};

export default Products;
