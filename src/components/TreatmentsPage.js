import ScrollSelect from './ScrollSelect';
import SwiperEmbla from './Swiper/SwiperEmbla';
import { gsap } from 'gsap';
import { createPopup, nurseLedId } from './Utility/Forms';

// Selectors
let scrollSelectNode,
  scrollSelectSlides,
  swiperNode,
  swiperViewportNode,
  progressNode;

if (
  document.querySelector('.treatments-category__container:first-child.embla')
) {
  scrollSelectNode = document.querySelector(
    '.treatments-category__container:first-child.embla'
  );
  scrollSelectSlides =
    '.scroll-select-type.treatments-category__category.embla__slide';
}

if (
  document.querySelector('.treatments-category__container:last-child.embla')
) {
  swiperNode = document.querySelector(
    '.treatments-category__container:last-child.embla'
  );
  swiperViewportNode = document.querySelector(
    '.treatments-category__container:last-child.embla .embla__viewport'
  );

  if (swiperNode) {
    progressNode = swiperNode.querySelector(
      '.treatments-category__container:last-child.embla .embla__progress-bar'
    );
  }
}

const treatmentsPageAreas = document.querySelectorAll(
  '.template-treatments-category .filter-header__input'
);

treatmentsPageAreas.forEach(function (area) {
  area.addEventListener('change', function () {
    if (this.checked) {
      window.location.href = '/pages/' + this.value;
    }
  });
});

const treatmentsPageResults = document.querySelector(
  '#treatments-page-results'
);

// Function to normalize the skin concern strings
function normalize(str) {
  // Convert to lowercase and remove leading/trailing whitespace
  str = str.toLowerCase().trim();

  // Replace spaces with '-'
  str = str.replace(/\s+/g, '-');

  return str;
}

// Get all the treatment types elements
const treatmentTypes = document.querySelectorAll(
  '.scroll-select-type.treatments-category__category'
);

// Function to fetch and display treatments
function displayResults() {
  // Get the active skin concern and normalize it
  const activeTreatmentType = document.querySelector(
    '.scroll-select-type.treatments-category__category.active'
  );

  // Check if activeTreatmentType exists
  if (activeTreatmentType) {
    const selectedType = normalize(
      activeTreatmentType.getAttribute('data-slide-treatment-category')
    );

    // Create a new URL object with the current location
    const url = new URL(window.location.href);

    // Use the searchParams property of the URL object to get a URLSearchParams object
    const searchParams = url.searchParams;

    // Use the set method of the URLSearchParams object to set the query parameter
    searchParams.set('type', selectedType);

    // Update the URL without reloading the page
    history.pushState(null, '', url.toString());

    displayPages(selectedType);
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced version of displayResults
const debouncedDisplayResults = debounce(displayResults, 100);

// Create a MutationObserver instance
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Check if a class was added
    const wasClassAdded =
      mutation.target.classList.length > mutation.oldValue.split(' ').length;

    if (
      mutation.attributeName === 'class' &&
      wasClassAdded &&
      mutation.target.classList.contains('active')
    ) {
      // Call debouncedDisplayResults to update the displayed products or treatments
      debouncedDisplayResults();
    }
  });
});

// Start observing each treatment type element for changes in its 'class' attribute
treatmentTypes.forEach((treatmentType) => {
  observer.observe(treatmentType, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true,
  });
});

// Shopify API call
const shopifyStorefrontAccessToken = 'd20d0cde1f02fc638e0611331c45a289';
const shopifyStoreUrl = 'https://rewind-skin-co.myshopify.com';

const metafields = [
  'featured_image_treatments',
  'treatment_area_treatments',
  'starting_rate_treatments',
  'booking_link_treatments',
  'related_treatment_types_treatments',
];

const fetchMetafield = (pageId, metafieldKey) => {
  const query = `
    {
      node(id: "${pageId}") {
        ... on Page {
          metafield(namespace: "custom", key: "${metafieldKey}") {
            value
          }
        }
      }
    }
  `;

  return fetch(`${shopifyStoreUrl}/api/2021-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyStorefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data.node.metafield) {
        try {
          return JSON.parse(data.data.node.metafield.value);
        } catch (error) {
          return data.data.node.metafield.value;
        }
      } else {
        return null;
      }
    });
};

const fetchPages = () => {
  const query = `
    {
      pages(first: 14) {
        edges {
          node {
            id
            title
            body
            metafield(namespace: "custom", key: "treatment_page") {
              value
            }
          }
        }
      }
    }
  `;

  return fetch(`${shopifyStoreUrl}/api/2021-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyStorefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      const pages = data.data.pages.edges
        .map((edge) => edge.node)
        .filter((page) => page.metafield && page.metafield.value === 'true');
      return pages;
    });
};

// Function to fetch and display pages
function displayPages(selectedType) {
  // Clear the current contents of treatmentsPageResults
  treatmentsPageResults.innerHTML = '';

  // Start the animation with opacity 0
  gsap.set(treatmentsPageResults, { opacity: 0 });

  // Start the animation to opacity 1, but pause it immediately
  const animation = gsap.to(treatmentsPageResults, {
    opacity: 1,
    duration: 0.5,
    paused: true,
  });

  // Determine the current page based on the checked radio button
  const currentPage = document.querySelector(
    'input[name="treatments-page-filter"]:checked'
  )?.value;

  // Map the current page to the corresponding treatment area
  const pageToTreatmentArea = {
    'face-skin-treatments': 'face',
    'body-skin-treatments': 'body',
    'skin-treatments': ['face', 'body'],
  };
  const currentTreatmentArea = pageToTreatmentArea[currentPage];

  // Fetch and display the pages
  fetchPages()
    .then((pages) => {
      return Promise.all(
        pages.map((page) =>
          Promise.all(
            metafields.map((metafield) =>
              fetchMetafield(page.id, metafield).then((value) => ({
                [metafield]: value,
              }))
            )
          ).then((metafields) => ({
            ...page,
            metafields: Object.assign({}, ...metafields),
          }))
        )
      );
    })
    .then((pages) => {
      // Normalize and filter the pages based on the selected treatments type
      const relatedPages = pages.filter((page) => {
        const normalizedTypes =
          page.metafields.related_treatment_types_treatments.map(normalize);
        let treatmentAreaMatches = false;
        if (
          Array.isArray(currentTreatmentArea) &&
          Array.isArray(page.metafields.treatment_area_treatments)
        ) {
          treatmentAreaMatches = currentTreatmentArea.some((area) =>
            page.metafields.treatment_area_treatments.includes(area)
          );
        } else if (Array.isArray(page.metafields.treatment_area_treatments)) {
          treatmentAreaMatches =
            page.metafields.treatment_area_treatments.includes(
              currentTreatmentArea
            );
        } else {
          treatmentAreaMatches =
            currentTreatmentArea === page.metafields.treatment_area_treatments;
        }
        return normalizedTypes.includes(selectedType) && treatmentAreaMatches;
      });

      relatedPages.forEach((page) => {
        // Normalize the treatment types before comparing
        const normalizedTypes =
          page.metafields.related_treatment_types_treatments.map(normalize);
        // Check if the page's skin concerns include the selected concern
        if (normalizedTypes.includes(selectedType)) {
          const card = document.createElement('div');
          card.className = 'treatments-category__card embla__slide';

          const info = document.createElement('div');
          info.className = 'treatment-card__info';

          const title = document.createElement('h4');
          title.className = 'treatment-card__treatment';
          title.textContent = page.title;

          // const link = document.createElement('a');
          // link.href = page.metafields.booking_link_treatments;
          // link.className = page.metafields.starting_rate_treatments
          //   ? 'all-caps btn btn--primary treatment-card__btn'
          //   : 'all-caps btn btn--primary treatment-card__btn treatment-card__btn--icon';
          // if (!page.metafields.starting_rate_treatments) {
          //   link.textContent = !page.metafields.booking_link_treatments
          //     ? 'Inquire Now'
          //     : 'Book Now';
          // }
          // link.target = '_blank'; // This line makes the link open in a new window

          // if (!page.metafields.booking_link_treatments) {
          //   link.target = '';
          //   link.href = '#';
          //   link.classList.add('nurse-led-inquiry-trigger');
          //   const { open } = createPopup(nurseLedId);
          //   link.onclick = open;
          // }

          // if (page.metafields.starting_rate_treatments) {
          //   const bookNow = document.createElement('span');
          //   bookNow.textContent = 'Book Now';
          //   const price = document.createElement('span');
          //   price.textContent = `$${page.metafields.starting_rate_treatments}`;
          //   link.append(bookNow, price);
          // }

          let link;
          let btnCta = document.createElement('span');

          if (!page.metafields.booking_link_treatments) {
            link = document.createElement('p');
            link.classList.add(
              'all-caps',
              'btn',
              'btn--primary',
              'treatment-card__btn',
              'nurse-led-inquiry-trigger'
            );
            const { open } = createPopup(nurseLedId);
            link.onclick = open;
            btnCta.textContent = 'Inquire Now';
          } else {
            link = document.createElement('a');
            link.href = page.metafields.booking_link_treatments;
            link.className = page.metafields.starting_rate_treatments
              ? 'all-caps btn btn--primary treatment-card__btn'
              : 'all-caps btn btn--primary treatment-card__btn treatment-card__btn--icon';
            link.target = '_blank'; // This line makes the link open in a new window
            btnCta.textContent = 'Book Now';
          }

          link.append(btnCta);

          const image = document.createElement('img');
          image.className = 'treatment-card__image';
          image.src = page.metafields.featured_image_treatments;
          image.width = '292';
          image.height = '438';
          image.loading = 'lazy';

          info.append(title, link);
          card.append(info, image);
          treatmentsPageResults.append(card);
        }
      });
      // Resume the animation after the data has been loaded and rendered
      animation.play();
    })
    .catch((error) => console.error('Error:', error));
}

const TreatmentsPage = () => {
  displayResults();
  // Check if scrollSelectNode exists
  if (!scrollSelectNode) {
    return;
  }

  let { embla, cleanup, getActiveSlide } = ScrollSelect(
    scrollSelectNode,
    scrollSelectSlides,
    null,
    {
      axis: 'x',
    },
    'data-slide-treatment-category',
    'type'
  );

  // Check if swiperNode exists
  if (swiperNode) {
    SwiperEmbla(swiperViewportNode, progressNode, false);
  }
};

export default TreatmentsPage;
