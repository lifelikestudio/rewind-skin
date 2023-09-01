// emblaCarouselSetup.js
import EmblaCarousel from 'embla-carousel';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

// Add this function at the top of your file
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const defaultOptions = {
  loop: true,
  axis: 'y',
  align: 'start',
  dragFree: false,
  duration: 40,
  inViewThreshold: 0.8,
  skipSnaps: true,
  breakpoints: {
    '(max-width: 1023px)': { axis: 'x' },
  },
};

const ScrollSelect = (
  emblaNode,
  slideSelector,
  onSelectCallback,
  options = {},
  attrName = 'data-slide-concern', // Add this line
  queryParamName
) => {
  const mergedOptions = { ...defaultOptions, ...options };

  const wheelGesturesOptions = {
    forceWheelAxis: 'y',
    target: emblaNode,
  };

  let embla = EmblaCarousel(emblaNode, mergedOptions, [
    WheelGesturesPlugin(wheelGesturesOptions),
  ]);

  // Get all the slides
  let slides = Array.from(document.querySelectorAll(slideSelector));

  // Add this function inside the ScrollSelect function
  // Use attrName in getActiveSlide
  const getActiveSlide = () => {
    const activeIndex = embla.selectedScrollSnap();
    const activeSlide = slides[activeIndex];
    const slideId = activeSlide.getAttribute(attrName);
    console.log(`Active slide ID: ${slideId}`);
    return activeSlide;
  };

  // Listen for the "select" event, which is fired when the carousel's active slide changes
  const onSelect = () => {
    // Get the index of the currently selected slide
    const activeIndex = embla.selectedScrollSnap();

    // Remove the "active" class from all slides
    slides.forEach((slide) => slide.classList.remove('active'));

    // Add the "active" class to the currently selected slide
    slides[activeIndex].classList.add('active');

    // Call getActiveSlide and log the active slide
    getActiveSlide();
  };
  embla.on('select', onSelect);

  /// Check if a query parameter is present and use it to set the active slide
  const activeSlideParam = getQueryParam(queryParamName);
  if (activeSlideParam) {
    const activeSlideIndex = slides.findIndex(
      (slide) => slide.getAttribute(attrName) === activeSlideParam
    );
    if (activeSlideIndex !== -1) {
      embla.scrollTo(activeSlideIndex);
    }
    // Always call onSelect after setting the active slide
    onSelect();
  } else {
    onSelect();
  }

  // Add a click event listener to each slide
  const onClick = (index) => {
    // Scroll to the clicked slide
    embla.scrollTo(index);
  };
  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => onClick(index));
  });

  // Return embla and the cleanup function
  return {
    embla,
    getActiveSlide,
    cleanup: () => {
      embla.off('select', onSelect);
      slides.forEach((slide) => {
        slide.removeEventListener('click', () => onClick);
      });
      embla.destroy();
    },
  };
};

export default ScrollSelect;
