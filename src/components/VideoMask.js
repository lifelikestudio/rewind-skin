import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Selectors
const videoMaskHalf = document.querySelectorAll(
  '.brand-section__video-mask-half'
);
const brandStatement = document.querySelector('.brand-section__statement');

const VideoMask = () => {
  gsap.registerPlugin(ScrollTrigger);

  if (videoMaskHalf.length > 0 && brandStatement) {
    videoMaskHalf.forEach((videoMaskHalf) => {
      if (videoMaskHalf) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: videoMaskHalf,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
            immediateRender: false,
            once: true,
          },
        });

        tl.to(videoMaskHalf, {
          width: '0%',
          ease: 'power1.inOut',
        });
      }
    });

    // if (brandStatement) {
    //   gsap.to(brandStatement, {
    //     scrollTrigger: {
    //       trigger: brandStatement,
    //       start: 'top bottom',
    //       end: '+=75%',
    //       scrub: true,
    //       immediateRender: false,
    //       once: true,
    //     },
    //     opacity: 1,
    //     ease: 'power1.inOut',
    //   });
    // }
  }
};

export default VideoMask;
