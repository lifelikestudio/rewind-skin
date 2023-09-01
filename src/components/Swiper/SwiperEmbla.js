import EmblaCarousel from 'embla-carousel';
import SwiperScrollbar from './SwiperScrollbar.js';

const SwiperEmbla = (swiperViewportNode, progressNode, loopOption = true) => {
  const options = {
    loop: loopOption,
    axis: 'x',
    align: 'start',
    dragFree: false,
    duration: 40,
    inViewThreshold: 0.8,
    skipSnaps: true,
    slidesToScroll: 1,
  };

  const swiper = EmblaCarousel(swiperViewportNode, options);
  const { applyProgress, removeProgress } = SwiperScrollbar(
    swiper,
    progressNode
  );
  swiper
    .on('init', applyProgress)
    .on('reInit', applyProgress)
    .on('scroll', applyProgress)
    .on('destroy', removeProgress);
};

export default SwiperEmbla;
