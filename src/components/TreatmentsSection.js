import { gsap } from 'gsap';
import SwiperEmbla from './Swiper/SwiperEmbla';

// Selectors
const treatmentsSectionViewportNode = document.querySelector(
  '.treatments-section__column:last-child.embla .embla__viewport'
);
const treatmentsSectionProgressNode = document.querySelector(
  '.treatments-section__column .embla__progress-bar'
);

const treatmentsSectionResults = document.querySelector(
  '#treatments-section-results'
);

const faceRadio = document.querySelector('#treatments-section-filter-face');
const bodyRadio = document.querySelector('#treatments-section-filter-body');

// Shopify API call
const shopifyStorefrontAccessToken = 'f0802d0c9602af67c9785320bf29348f';
const shopifyStoreUrl = 'https://rewind-skin-v2.myshopify.com';

function normalize(str) {
  return str.toLowerCase();
}

const metafields = [
  'featured_image_treatments',
  'treatment_area_treatments',
  'starting_rate_treatments',
  'booking_link_treatments',
  'related_treatment_types_treatments',
  'treatment_description_treatments',
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
function displayPages() {
  // Clear the current contents of treatmentsSectionResults
  treatmentsSectionResults.innerHTML = '';

  // Start the animation with opacity 0
  gsap.set(treatmentsSectionResults, { opacity: 0 });

  // Start the animation to opacity 1, but pause it immediately
  const animation = gsap.to(treatmentsSectionResults, {
    opacity: 1,
    duration: 0.5,
    paused: true,
  });

  // Fetch and display the pages
  fetchPages()
    .then((pages) =>
      Promise.all(
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
      )
    )
    .then((pages) => {
      // Filter the pages based on the checked radio button
      if (faceRadio.checked) {
        pages = pages.filter((page) =>
          page.metafields.treatment_area_treatments.includes('face')
        );
      } else if (bodyRadio.checked) {
        pages = pages.filter((page) =>
          page.metafields.treatment_area_treatments.includes('body')
        );
      }

      pages.forEach((page) => {
        const card = document.createElement('div');
        card.className = 'treatments-section__card embla__slide';

        const cardInner = document.createElement('div');
        cardInner.className = 'treatments-section__card-inner';

        const info = document.createElement('div');
        info.className = 'treatment-card__info';

        const infoInner = document.createElement('div');
        infoInner.className = 'info__inner';

        const title = document.createElement('h3');
        title.className = 'treatment-card__treatment';
        title.textContent = page.title;

        let price; // Define price here
        if (page.metafields.starting_rate_treatments) {
          price = document.createElement('span');
          price.className = 'all-caps treatment-card__rate';
          price.textContent = `$${page.metafields.starting_rate_treatments}`;
        }

        const description = document.createElement('p');
        description.className = 'treatment-card__description';
        description.textContent =
          page.metafields.treatment_description_treatments;

        const link = document.createElement('a');
        link.href = page.metafields.booking_link_treatments;
        link.className = 'all-caps btn btn--primary treatment-card__btn';
        link.target = '_blank'; // This line makes the link open in a new window

        const bookNow = document.createElement('span');
        bookNow.textContent = 'Book Now';

        link.append(bookNow);

        const image = document.createElement('img');
        image.className = 'treatment-card__image';
        image.src = page.metafields.featured_image_treatments;
        image.width = '370';
        image.height = '555';
        image.loading = 'lazy';

        if (page.metafields.starting_rate_treatments) {
          infoInner.append(title, price);
        } else {
          infoInner.append(title);
        }
        info.append(infoInner, description);
        cardInner.append(info, link);
        card.append(cardInner, image);
        treatmentsSectionResults.append(card);
      });
      // Resume the animation after the data has been loaded and rendered
      animation.play();
    })
    .catch((error) => console.error('Error:', error));
}

// Add event listener to the products radio button
if (faceRadio) {
  faceRadio.addEventListener('change', function () {
    if (this.checked) {
      displayPages();
    }
  });
}

if (bodyRadio) {
  // Add event listener to the treatments radio button
  bodyRadio.addEventListener('change', function () {
    if (this.checked) {
      displayPages();
    }
  });
}

const treatmentsSection = () => {
  SwiperEmbla(treatmentsSectionViewportNode, treatmentsSectionProgressNode);
};

const TreatmentsSection = () => {
  if (treatmentsSectionViewportNode) {
    treatmentsSection();
  }

  // Check which radio button is checked on page load
  if (faceRadio && faceRadio.checked) {
    displayPages('face');
  } else if (bodyRadio && bodyRadio.checked) {
    displayPages('body');
  }
};

export default TreatmentsSection;
