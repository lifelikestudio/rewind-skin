// import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import {
  openDrawer,
  closeDrawer,
  closeDrawerWithPromise,
} from './DrawerHandlers.js';
import { gsap } from 'gsap';

// Selectors
// Utility
let windowWidth = window.innerWidth;
// Store the original text content of each header
let treatmentsHeaderText, shopHeaderText;
const treatmentsHeader = document.querySelector(
  '.drawer__header > #treatments-all'
);
const shopHeader = document.querySelector('.drawer__header > #shop-all');
if (treatmentsHeader) {
  treatmentsHeaderText = treatmentsHeader.textContent;
}

if (shopHeader) {
  shopHeaderText = shopHeader.textContent;
}

// Triggers
const treatmentsAction = document.getElementById('treatments-action');
const shopAction = document.getElementById('shop-action');
const cartAction = document.getElementById('cart-action');
const refineAction = document.getElementById('refine-action');
const mobileAction = document.getElementById('mobile-action');
const mobileCartAction = document.getElementById('mobile-cart-action');
const treatmentsMobileAction = document.getElementById(
  'treatments-mobile-action'
);
const shopMobileAction = document.getElementById('shop-mobile-action');
const filtersCategoriesMobileAction = document.getElementById(
  'categories-mobile-action'
);
const filtersConcernsMobileAction = document.getElementById(
  'concerns-mobile-action'
);
const filtersTypesMobileAction = document.getElementById('types-mobile-action');
const filtersBrandsMobileAction = document.getElementById(
  'brands-mobile-action'
);
const searchAction = document.getElementById('search-action');
const searchMobileAction = document.getElementById('search-mobile-action');

// Drawers
const treatmentsMenu = document.getElementById('treatments-menu');
const shopMenu = document.getElementById('shop-menu');
export const drawerCart = document.getElementById('drawer-cart');

const refineMenu = document.getElementById('mobile-refine');
const mobileMenu = document.getElementById('mobile-menu');
const filtersCategoriesMobileMenu = document.getElementById(
  'filters-categories-menu'
);
const filtersConcernsMobileMenu = document.getElementById(
  'filters-concerns-menu'
);
const filtersTypesMobileMenu = document.getElementById('filters-types-menu');
const filtersBrandsMobileMenu = document.getElementById('filters-brands-menu');
const searchDrawer = document.getElementById('search-drawer');

// Close Buttons
const cartClose = document.getElementById('cart-close');
const refineClose = document.getElementById('refine-close');
const mobileMenuClose = document.getElementById('menu-close');
const treatmentsClose = treatmentsMenu.querySelector('.menu-back');
const shopClose = shopMenu.querySelector('.menu-back');
const searchClose = document.getElementById('search-close');

const filtersCategoriesMobileBack = filtersCategoriesMobileMenu
  ? filtersCategoriesMobileMenu.querySelector('.menu-back')
  : null;
const filtersConcernsMobileBack = filtersConcernsMobileMenu
  ? filtersConcernsMobileMenu.querySelector('.menu-back')
  : null;
const filtersTypesMobileBack = filtersTypesMobileMenu
  ? filtersTypesMobileMenu.querySelector('.menu-back')
  : null;
const filtersBrandsMobileBack = filtersBrandsMobileMenu
  ? filtersBrandsMobileMenu.querySelector('.menu-back')
  : null;
const filtersCategoriesMobileClose =
  document.getElementById('categories-close');
const filtersConcernsMobileClose = document.getElementById('concerns-close');
const filtersTypesMobileClose = document.getElementById('types-close');
const filtersBrandsMobileClose = document.getElementById('brands-close');
// Get the 'filters-show-results' button
const showResultsButton = document.getElementById('filters-show-results');

// Get the #filters-clear-apply element
const filtersClearApply = document.getElementById('filters-clear-apply');

// Get all forms with the class .collections__filter-form
const filterForms = document.querySelectorAll(
  '.collections__filter-form, .search-results__filter-form'
);

// Function to check if any checkbox is checked within a form
const isAnyCheckboxChecked = (form) => {
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
};

// Function to update the state of checkboxes
const updateCheckboxState = () => {
  const anyCheckboxChecked = Array.from(filterForms).some(isAnyCheckboxChecked);
  return anyCheckboxChecked;
};
// Function to slide up and fade in
const slideUpAndFadeIn = (
  element,
  yValue = 0,
  duration = 0.4,
  autoAlphaValue = 1,
  autoAlphaDuration = 0.2,
  overlap = 0.15
) => {
  const tl = gsap.timeline();
  tl.to(element, { y: yValue, duration: duration }).to(
    element,
    { autoAlpha: autoAlphaValue, duration: autoAlphaDuration },
    `-=${overlap}`
  );
  return tl;
};

// Function to fade out and slide down
const fadeOutAndSlideDown = (
  element,
  yValue,
  duration = 0.2,
  autoAlphaValue = 0,
  autoAlphaDuration = 0.1
) => {
  const tl = gsap.timeline();
  tl.to(element, { autoAlpha: autoAlphaValue, duration: autoAlphaDuration })
    .to(element, { y: yValue, duration: duration })
    .then(() => {
      element.classList.remove('visible');
    });
  return tl;
};

// Use the functions in your code
const updateFiltersClearApplyVisibility = () => {
  const checkboxState = updateCheckboxState();
  if (checkboxState && refineMenu.classList.contains('drawer--active')) {
    filtersClearApply.classList.add('visible');
    slideUpAndFadeIn(filtersClearApply, 0); // Include y value here
  } else {
    if (filtersClearApply) {
      const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds to the element's height
      fadeOutAndSlideDown(filtersClearApply, y);
    }
  }
};

// Add event listener to each form
filterForms.forEach((form) => {
  form.addEventListener('change', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
      const checkboxState = updateCheckboxState();
      console.log(checkboxState); // You can replace this with your own logic
      updateFiltersClearApplyVisibility();
    }
  });
});

// Functions
const modifyHeaderText = () => {
  const treatmentsHeader = document.querySelector(
    '.drawer__header > #treatments-all'
  );
  const shopHeader = document.querySelector('.drawer__header > #shop-all');

  [treatmentsHeader, shopHeader].forEach((header, index) => {
    if (header) {
      if (window.matchMedia('(max-width: 1055px)').matches) {
        const words = header.textContent.split(' ');
        const filteredWords = words.filter(
          (word) => word.toLowerCase() === 'all'
        );
        header.textContent = filteredWords.join(' ');
      } else {
        // Reset the header text when screen size is larger than 1055px
        if (index === 0 && treatmentsHeaderText) {
          header.textContent = treatmentsHeaderText;
        } else if (index === 1 && shopHeaderText) {
          header.textContent = shopHeaderText;
        }
      }
    }
  });
};

const debounce = (func, delay = 200) => {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

const triggerDrawer = (trigger, drawer, position = '0%', axis = 'x') => {
  if (!trigger || !drawer) {
    return;
  }

  const hoverTrigger = debounce((e) => {
    openDrawer(drawer);
    e.stopPropagation();
  });

  const clickTrigger = debounce((e) => {
    openDrawer(drawer, position, axis);
    e.stopPropagation;
    if (drawer === refineMenu) {
      updateFiltersClearApplyVisibility();
    }
  });

  trigger.removeEventListener('mouseover', hoverTrigger);
  trigger.removeEventListener('click', clickTrigger);

  if (trigger === treatmentsAction || trigger === shopAction) {
    if (window.matchMedia('(min-width: 1056px)').matches) {
      trigger.addEventListener('mouseover', hoverTrigger);
    }
    drawer.addEventListener('mouseenter', function () {
      this.hovered = true;
    });
  } else {
    trigger.addEventListener('click', clickTrigger);
  }
};

const dismissDrawer = (drawer, closeButton) => {
  if (drawer === treatmentsMenu || drawer === shopMenu) {
    drawer.addEventListener('mouseleave', function () {
      if (window.matchMedia('(min-width: 1056px)').matches) {
        if (this.hovered) {
          closeDrawer(drawer);
          this.hovered = false;
        }
      }
    });
  }
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      // If the drawer is treatmentsMenu or shopMenu, only dismiss the drawer
      if (
        drawer === treatmentsMenu ||
        drawer === shopMenu ||
        drawer === filtersCategoriesMobileMenu ||
        drawer === filtersConcernsMobileMenu ||
        drawer === filtersTypesMobileMenu ||
        drawer === filtersBrandsMobileMenu
      ) {
        closeDrawer(drawer, undefined, false);
      } else {
        // For other drawers, dismiss the drawer and close the popover
        if (drawer === drawerCart) {
          closeDrawer(drawer, '100%');
        } else if (drawer === searchDrawer) {
          closeDrawer(drawer, undefined, undefined, 'y');
        } else {
          closeDrawer(drawer);
        }
      }
      e.stopPropagation();
      // If the drawer is the refineMenu, hide filtersClearApply
      if (drawer === refineMenu) {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
      }
    });
  }
  document.addEventListener('click', function (event) {
    if (
      drawer &&
      !drawer.contains(event.target) &&
      drawer.classList.contains('drawer--active')
    ) {
      if (window.matchMedia('(max-width: 1055px)').matches) {
        if (
          treatmentsMenu.contains(event.target) ||
          shopMenu.contains(event.target) ||
          (filtersCategoriesMobileMenu &&
            filtersCategoriesMobileMenu.contains(event.target)) ||
          (filtersConcernsMobileMenu &&
            filtersConcernsMobileMenu.contains(event.target)) ||
          (filtersTypesMobileMenu &&
            filtersTypesMobileMenu.contains(event.target)) ||
          (filtersBrandsMobileMenu &&
            filtersBrandsMobileMenu.contains(event.target))
        ) {
          return;
        }
      }

      if (drawer === drawerCart) {
        closeDrawer(drawer, '100%');
      } else if (drawer === searchDrawer) {
        closeDrawer(drawer, undefined, undefined, 'y');
      } else {
        closeDrawer(drawer);
      }

      // If the drawer is the refineMenu, hide filtersClearApply
      if (drawer === refineMenu) {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
      }
    }
  });
  if (drawer === refineMenu) {
    if (filtersClearApply) {
      const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
      fadeOutAndSlideDown(filtersClearApply, y);
    }
  }
};

const resizeEvents = () => {
  window.addEventListener(
    'resize',
    debounce(() => {
      if (window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        // Close all menus
        [
          treatmentsMenu,
          shopMenu,
          drawerCart,
          refineMenu,
          mobileMenu,
          filtersCategoriesMobileMenu,
          filtersConcernsMobileMenu,
          filtersTypesMobileMenu,
          filtersBrandsMobileMenu,
          searchDrawer,
        ].forEach((menu) => {
          if (menu && menu.classList.contains('drawer--active')) {
            if (menu === drawerCart) {
              closeDrawer(menu, '100%');
            } else if (menu === searchDrawer) {
              closeDrawer(menu, undefined, undefined, 'y');
            } else {
              closeDrawer(menu);
            }
          }
        });

        // Update the visibility of filtersClearApply
        updateFiltersClearApplyVisibility();

        // Re-trigger drawers
        triggerDrawer(treatmentsAction, treatmentsMenu);
        triggerDrawer(shopAction, shopMenu);
        triggerDrawer(cartAction, drawerCart);
        triggerDrawer(refineAction, refineMenu);
        triggerDrawer(mobileAction, mobileMenu);
        triggerDrawer(mobileCartAction, drawerCart);
        triggerDrawer(
          filtersCategoriesMobileAction,
          filtersCategoriesMobileMenu
        );
        triggerDrawer(filtersConcernsMobileAction, filtersConcernsMobileMenu);
        triggerDrawer(filtersTypesMobileAction, filtersTypesMobileMenu);
        triggerDrawer(filtersBrandsMobileAction, filtersBrandsMobileMenu);
        triggerDrawer(searchAction, searchDrawer, '0%', 'y');
        searchMobileAction.addEventListener('click', (e) => {
          e.stopPropagation();

          // First, close the mobileMenu
          closeDrawerWithPromise(mobileMenu).then(() => {
            // After the mobileMenu is closed, open the searchDrawer
            openDrawer(searchDrawer, '0%', 'y');
          });
        });

        modifyHeaderText();
      }
    })
  );
};

// Export individual functions for setting up event listeners for each drawer
export const setupFiltersCategoriesMobileDrawer = () => {
  if (filtersCategoriesMobileAction && filtersCategoriesMobileMenu) {
    triggerDrawer(filtersCategoriesMobileAction, filtersCategoriesMobileMenu);
    if (filtersCategoriesMobileBack) {
      dismissDrawer(filtersCategoriesMobileMenu, filtersCategoriesMobileBack);
    }
    if (filtersCategoriesMobileClose) {
      filtersCategoriesMobileClose.addEventListener('click', () => {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
        closeDrawer(filtersCategoriesMobileMenu);
        closeDrawer(refineMenu);
      });
    }
    setupCategoriesDrawerElements(); // Call the setup function for elements within the drawer
  }
};

export const setupFiltersConcernsMobileDrawer = () => {
  if (filtersConcernsMobileAction && filtersConcernsMobileMenu) {
    triggerDrawer(filtersConcernsMobileAction, filtersConcernsMobileMenu);
    if (filtersConcernsMobileBack) {
      dismissDrawer(filtersConcernsMobileMenu, filtersConcernsMobileBack);
    }
    if (filtersConcernsMobileClose) {
      filtersConcernsMobileClose.addEventListener('click', () => {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
        closeDrawer(filtersConcernsMobileMenu);
        closeDrawer(refineMenu);
      });
    }
    setupConcernsDrawerElements(); // Call the setup function for elements within the drawer
  }
};

export const setupFiltersTypesMobileDrawer = () => {
  if (filtersTypesMobileAction && filtersTypesMobileMenu) {
    triggerDrawer(filtersTypesMobileAction, filtersTypesMobileMenu);
    if (filtersTypesMobileBack) {
      dismissDrawer(filtersTypesMobileMenu, filtersTypesMobileBack);
    }
    if (filtersTypesMobileClose) {
      filtersTypesMobileClose.addEventListener('click', () => {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
        closeDrawer(filtersTypesMobileMenu);
        closeDrawer(refineMenu);
      });
    }
    setupTypesDrawerElements(); // Call the setup function for elements within the drawer
  }
};

export const setupFiltersBrandsMobileDrawer = () => {
  if (filtersBrandsMobileAction && filtersBrandsMobileMenu) {
    triggerDrawer(filtersBrandsMobileAction, filtersBrandsMobileMenu);
    if (filtersBrandsMobileBack) {
      dismissDrawer(filtersBrandsMobileMenu, filtersBrandsMobileBack);
    }
    if (filtersBrandsMobileClose) {
      filtersBrandsMobileClose.addEventListener('click', () => {
        if (filtersClearApply) {
          const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
          fadeOutAndSlideDown(filtersClearApply, y);
        }
        closeDrawer(filtersBrandsMobileMenu);
        closeDrawer(refineMenu);
      });
    }
    setupBrandsDrawerElements(); // Call the setup function for elements within the drawer
  }
};

// Add setup functions for elements within each drawer here
export const setupCategoriesDrawerElements = () => {
  document.addEventListener('click', (event) => {
    if (event.target.matches('#filters-categories-menu .menu-back')) {
      dismissDrawer(filtersCategoriesMobileMenu, filtersCategoriesMobileBack);
    }
  });
};

export const setupConcernsDrawerElements = () => {
  document.addEventListener('click', (event) => {
    if (event.target.matches('#filters-concerns-menu .menu-back')) {
      dismissDrawer(filtersConcernsMobileMenu, filtersConcernsMobileBack);
    }
  });
};

export const setupTypesDrawerElements = () => {
  document.addEventListener('click', (event) => {
    if (event.target.matches('#filters-types-menu .menu-back')) {
      dismissDrawer(filtersTypesMobileMenu, filtersTypesMobileBack);
    }
  });
};

export const setupBrandsDrawerElements = () => {
  document.addEventListener('click', (event) => {
    if (event.target.matches('#filters-brands-menu .menu-back')) {
      dismissDrawer(filtersBrandsMobileMenu, filtersBrandsMobileBack);
    }
  });
};

const Drawers = () => {
  triggerDrawer(treatmentsAction, treatmentsMenu);
  dismissDrawer(treatmentsMenu, treatmentsClose);
  triggerDrawer(treatmentsMobileAction, treatmentsMenu);
  triggerDrawer(shopAction, shopMenu);
  triggerDrawer(shopMobileAction, shopMenu);
  dismissDrawer(shopMenu, shopClose);
  triggerDrawer(cartAction, drawerCart);
  triggerDrawer(mobileCartAction, drawerCart);
  dismissDrawer(drawerCart, cartClose);
  triggerDrawer(refineAction, refineMenu);
  dismissDrawer(refineMenu, refineClose);
  triggerDrawer(mobileAction, mobileMenu);
  dismissDrawer(mobileMenu, mobileMenuClose);

  triggerDrawer(searchAction, searchDrawer, '0%', 'y');
  dismissDrawer(searchDrawer, searchClose);
  searchMobileAction.addEventListener('click', (e) => {
    e.stopPropagation();

    // First, close the mobileMenu
    closeDrawerWithPromise(mobileMenu).then(() => {
      // After the mobileMenu is closed, open the searchDrawer
      openDrawer(searchDrawer, '0%', 'y');
    });
  });

  setupFiltersCategoriesMobileDrawer();
  setupFiltersConcernsMobileDrawer();
  setupFiltersTypesMobileDrawer();
  setupFiltersBrandsMobileDrawer();

  resizeEvents();
  modifyHeaderText();

  // Add a click event listener to the 'filters-show-results' button
  if (showResultsButton) {
    showResultsButton.addEventListener('click', () => {
      // List of all possible open menus
      const menus = [
        refineMenu,
        filtersCategoriesMobileMenu,
        filtersConcernsMobileMenu,
        filtersTypesMobileMenu,
        filtersBrandsMobileMenu,
      ];

      // Close each menu if it's open
      menus.forEach((menu) => {
        if (menu && menu.classList.contains('drawer--active')) {
          closeDrawer(menu);
          if (filtersClearApply) {
            const y = filtersClearApply.offsetHeight + 32; // This assumes that 100% corresponds
            fadeOutAndSlideDown(filtersClearApply, y);
          }
        }
      });
    });
  }

  // Get the 'skin-concerns-mobile-action' element
  const skinConcernsAction = document.getElementById(
    'skin-concerns-mobile-action'
  );

  // Add a click event listener to the 'skin-concerns-mobile-action' element
  if (skinConcernsAction) {
    skinConcernsAction.addEventListener('click', () => {
      // List of all possible open menus
      const menus = [
        refineMenu,
        filtersCategoriesMobileMenu,
        filtersConcernsMobileMenu,
        filtersTypesMobileMenu,
        filtersBrandsMobileMenu,
        treatmentsMenu,
        shopMenu,
        drawerCart,
        mobileMenu,
        searchDrawer,
      ];

      // Close each menu if it's open
      menus.forEach((menu) => {
        if (menu && menu.classList.contains('drawer--active')) {
          closeDrawer(menu);
        }
      });
    });
  }
};

export default Drawers;

// const skinConcernsSmooth = () => {
//   gsap.registerPlugin(ScrollToPlugin);

//   const link = document.querySelector('#skin-concerns-action');

//   link.addEventListener('click', function (event) {
//     const target = document.querySelector('#skin-concerns-section');
//     if (target) {
//       event.preventDefault(); // prevent the default jump-to behavior

//       // Use GSAP to animate the scrolling
//       gsap.to(window, {
//         duration: 0.8, // Control the speed of the scroll here
//         scrollTo: {
//           y: '#skin-concerns-section', // Scroll to the target
//           autoKill: true, // Allow user to interrupt the scroll
//         },
//         ease: 'power1.inOut', // Choose an easing function
//       });
//     }
//   });

//   // If the URL contains the hash on page load
//   if (window.location.hash === '#skin-concerns-section') {
//     window.location.hash = ''; // Clear the hash
//     setTimeout(() => {
//       // Scroll to the target after a delay
//       gsap.to(window, {
//         duration: 1,
//         scrollTo: {
//           y: '#skin-concerns-section',
//           autoKill: true,
//         },
//         ease: 'power1.inOut',
//       });
//     }, 1000);
//   }
// };
