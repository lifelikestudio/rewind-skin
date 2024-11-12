import { gsap } from "gsap";
import ScrollSelect from "./ScrollSelect";
import SwiperEmbla from "./Swiper/SwiperEmbla";
import { attachEventListenersToProduct } from "./Drawers/CartDrawer.js";
import { createPopup, nurseLedId } from "./Utility/Forms";

const countryCode = document.documentElement.dataset.shopifyCountryCode || "CA";

function shuffleArray(array) {
  // First do a basic shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  // Then ensure no adjacent vendors
  for (let i = 1; i < array.length; i++) {
    if (array[i].vendor === array[i - 1].vendor) {
      // Look for the next product with a different vendor
      for (let j = i + 1; j < array.length; j++) {
        if (array[j].vendor !== array[i - 1].vendor) {
          // Swap the products
          [array[i], array[j]] = [array[j], array[i]];
          break;
        }
      }
    }
  }

  return array;
}

// Selectors
let scrollSelectNode,
  scrollSelectSlides,
  swiperNode,
  swiperViewportNode,
  progressNode;

if (document.querySelector(".concerns-section__inner:first-child.embla")) {
  scrollSelectNode = document.querySelector(
    ".concerns-section__inner:first-child.embla"
  );
  scrollSelectSlides = ".scroll-select-type.embla__slide";
}

if (document.querySelector(".concerns-section__inner:last-child.embla")) {
  swiperNode = document.querySelector(
    ".concerns-section__inner:last-child.embla"
  );
  swiperViewportNode = document.querySelector(
    ".concerns-section__inner:last-child.embla .embla__viewport"
  );

  if (swiperNode) {
    progressNode = swiperNode.querySelector(
      ".concerns-section__inner:last-child .embla__progress-bar"
    );
  }
}

const isCustomerLoggedIn = document.body.dataset.customerLoggedIn === "true";

// Get the radio buttons
const productsRadio = document.querySelector("#skin-concerns-filter-products");
const treatmentsRadio = document.querySelector(
  "#skin-concerns-filter-treatments"
);

const skinConcernsResults = document.querySelector("#skin-concerns-results");

// Function to normalize the skin concern strings
function normalize(str) {
  // Convert to lowercase and remove leading/trailing whitespace
  str = str.toLowerCase().trim();

  // Remove 'plus', 'and', 'of'
  str = str.replace(/\b(plus|and|of)\b/g, "");

  // Replace spaces with '-'
  str = str.replace(/\s+/g, "-");

  // Handle the special case
  if (str === "hyperpigmentation" || str === "scarring") {
    str = "hyperpigmentation-scarring";
  }

  return str;
}

// Get all the skin concern elements
const skinConcerns = document.querySelectorAll(
  ".scroll-select-type.concerns-section__skin-concern"
);

const getPriceDisplay = (variant) => {
  const priceValue = parseFloat(variant.price.amount);
  return {
    amount:
      priceValue % 1 === 0 ? priceValue.toFixed(0) : priceValue.toFixed(2),
    currencyCode: variant.price.currencyCode,
  };
};

// Function to fetch and display products or treatments based on the checked radio button
function displayResults() {
  // Get the active skin concern and normalize it
  const activeSkinConcern = document.querySelector(
    ".scroll-select-type.concerns-section__skin-concern.active"
  );

  // Check if activeSkinConcern exists
  if (activeSkinConcern) {
    const selectedConcern = normalize(
      activeSkinConcern.getAttribute("data-slide-concern")
    );

    if (productsRadio.checked) {
      displayProducts(selectedConcern);
    } else if (treatmentsRadio.checked) {
      displayPages(selectedConcern);
    }
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
      mutation.target.classList.length > mutation.oldValue.split(" ").length;

    if (
      mutation.attributeName === "class" &&
      wasClassAdded &&
      mutation.target.classList.contains("active")
    ) {
      // Call debouncedDisplayResults to update the displayed products or treatments
      debouncedDisplayResults();
    }
  });
});

// Start observing each skin concern element for changes in its 'class' attribute
skinConcerns.forEach((skinConcern) => {
  observer.observe(skinConcern, {
    attributes: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
  });
});

// Shopify API call
const shopifyStorefrontAccessToken = "d20d0cde1f02fc638e0611331c45a289";
const shopifyStoreUrl = "https://rewind-skin-co.myshopify.com/api/2024-01";

const metafields = [
  "featured_image_treatments",
  "treatment_area_treatments",
  "skin_concerns_treatments",
  "starting_rate_treatments",
  "booking_link_treatments",
  "related_treatment_types_treatments",
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

  return fetch(`${shopifyStoreUrl}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyStorefrontAccessToken,
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

const fetchAvailableCountries = () => {
  const query = `
    query {
      localization {
        availableCountries {
          currency {
            isoCode
            name
            symbol
          }
          isoCode
          name
        }
      }
    }
  `;

  return fetch(`${shopifyStoreUrl}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyStorefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Debug available currencies for current country
      const currentCountry = data.data?.localization?.availableCountries.find(
        (country) => country.isoCode === countryCode
      );

      return data;
    })
    .catch((error) => {
      console.error("Error fetching available countries:", error);
      throw error;
    });
};

const fetchProducts = () => {
  const query = `
  query ($country: CountryCode = CA, $language: LanguageCode = EN) @inContext(country: $country, language: $language) {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          vendor
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
              }
            }
          }
          metafield(namespace: "filters", key: "skin_concerns") {
            value
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                image {
                  url
                }
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
    `;

  return fetchAvailableCountries()
    .then(() => {
      return fetch(`${shopifyStoreUrl}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": shopifyStorefrontAccessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            country: countryCode,
            language: "EN",
          },
        }),
      });
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.errors) {
        console.error("GraphQL Errors:", data.errors);
        return [];
      }

      if (!data.data || !data.data.products) {
        console.error("Unexpected data structure:", data);
        return [];
      }

      // Get the products array and shuffle it
      const products = shuffleArray(
        data.data.products.edges.map((edge) => edge.node)
      );
      return products;

      // Debug first product's pricing
      const firstProduct = data.data.products.edges[0]?.node;

      return data.data.products.edges.map((edge) => edge.node);
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      return [];
    });
};

function displayProducts(selectedConcern) {
  // Clear the current contents of skinConcernsResults
  skinConcernsResults.innerHTML = "";

  // Start the animation with opacity 0
  gsap.set(skinConcernsResults, { opacity: 0 });

  // Start the animation to opacity 1, but pause it immediately
  const animation = gsap.to(skinConcernsResults, {
    opacity: 1,
    duration: 0.5,
    paused: true,
  });

  fetchProducts()
    .then((products) => {
      return Promise.all(
        products.map((product) => {
          if (product.metafields) {
            return Promise.all(
              product.metafields.map((metafield) =>
                fetchMetafield(product.id, metafield).then((value) => ({
                  [metafield]: value,
                }))
              )
            ).then((metafields) => ({
              ...product,
              metafields: Object.assign({}, ...metafields),
            }));
          } else {
            return product;
          }
        })
      );
    })
    .then((products) => {
      // Filter the products based on the selected skin concern
      const relatedProducts = products.filter(
        (product) =>
          product.metafield &&
          JSON.parse(product.metafield.value)
            .map(normalize)
            .includes(selectedConcern)
      );

      // Check if there are any related pages
      if (relatedProducts.length === 0) {
        const message = document.createElement("p");
        message.classList.add("main-body", "concerns-section__empty-res-msg");
        message.textContent =
          "We do not offer any products for this skin concern at this time. Please check for relevant treatments instead.";
        skinConcernsResults.append(message);
        // Resume the animation after the data has been loaded and rendered
        animation.play();
        return;
      }

      // Display the related products
      relatedProducts.forEach((product) => {
        // Fetch and display the products
        // Filter out the out-of-stock variants
        const inStockVariants = product.variants.edges.filter(
          (variantEdge) => variantEdge.node.availableForSale
        );

        // If there are no in-stock variants, don't render the product
        if (inStockVariants.length === 0) {
          return;
        }

        // If the product has only one variant, handle it as a single product
        if (product.variants.edges.length === 1) {
          const variant = product.variants.edges[0].node;
          const card = document.createElement("a");
          const variantId = variant.id.split("/").pop(); // Extract the actual ID
          card.href = `/products/${product.handle}?variant=${variantId}`; // Use the actual ID
          card.className =
            "concerns-section__card concerns-section__card--product embla__slide";

          const info = document.createElement("div");
          info.className = "product-card__info";

          const brand = document.createElement("p");
          brand.className = "all-caps product-card__brand";
          brand.textContent = product.vendor;

          const title = document.createElement("h4");
          title.className = "product-card__product";
          title.textContent = product.title;

          info.append(brand, title);

          // if (
          //   product.vendor.toLowerCase() === 'biologique recherche' &&
          //   !isCustomerLoggedIn
          // ) {
          //   const buttonDiv = document.createElement('div');
          //   buttonDiv.className =
          //     'all-caps btn btn--primary product-card__btn product-card__btn--icon';
          //   buttonDiv.dataset.url = `/account/login?checkout_url=/products/${product.handle}?variant=${variantId}`;
          //   buttonDiv.textContent = 'Login to Shop';
          //   // Set the href attribute of the parent anchor to the URL in the data-url attribute
          //   card.href = buttonDiv.dataset.url;
          //   card.append(info, buttonDiv);
          // } else {}
          if (
            product.vendor.toLowerCase() === "biologique recherche" &&
            countryCode === "US"
          ) {
            const buttonDiv = document.createElement("div");
            buttonDiv.className =
              "all-caps btn btn--primary product-card__btn product-card__btn--icon";
            buttonDiv.textContent = "Exclusive to Canada";
            // Make the button unclickable by styling it differently
            buttonDiv.style.cursor = "default";
            card.append(info, buttonDiv);
          } else {
            const form = document.createElement("form");
            form.action = "/cart/add";
            form.method = "post";
            form.className = "product-card__form";

            const idInput = document.createElement("input");
            idInput.type = "hidden";
            idInput.name = "id";
            idInput.value = variantId;

            const button = document.createElement("button");
            button.className = "all-caps btn btn--primary product-card__btn";

            const addToBag = document.createElement("span");
            addToBag.textContent = "Add to Bag";

            const price = document.createElement("span");
            const priceData = getPriceDisplay(variant);
            price.textContent = `$${priceData.amount} ${priceData.currencyCode}`;

            button.append(addToBag, price);
            form.append(idInput, button);
            attachEventListenersToProduct(form);

            card.append(info, form);
          }

          // Assuming 'product' is already defined and contains the product information
          // Assuming 'variant' is defined and represents the currently processed variant

          // Function to normalize option values
          function normalizeOption(option) {
            // If the option starts with a dollar sign, remove it
            if (option.startsWith("$")) {
              option = option.slice(1);
            }

            return option
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
              .replace(/[^a-z0-9]+/gi, "-") // Replace all non-alphanumeric characters (including spaces) with a single dash
              .toLowerCase() // Convert to lower case
              .replace(/^-+|-+$/g, ""); // Trim leading and trailing dashes
          }

          // Assuming 'variant' is defined and represents the currently processed variant
          // Select the first variant's value using the newly defined normalizeOption
          const firstVariantValue = normalizeOption(
            variant.selectedOptions[0]?.value
          );

          // Filter product images to find one that matches the criteria
          const matchingImage = product.images.edges.find((edge) => {
            const imageUrl = edge.node.url;
            return (
              imageUrl.includes("product-card") &&
              imageUrl.includes(firstVariantValue)
            );
          });

          // Determine the fallback image source: variant's image, or the product's first image if the variant has no image
          const fallbackImageSrc = variant.image
            ? variant.image.url
            : product.images.edges[0]?.node.url;

          // Use the matching image if found; otherwise, use the fallback image source
          const selectedImageSrc = matchingImage
            ? matchingImage.node.url
            : fallbackImageSrc;

          const image = document.createElement("img");
          image.className = "product-card__image";
          image.src = selectedImageSrc;
          image.width = "780";
          image.height = "1170";
          image.loading = "lazy";

          // Append the image to the card and the card to the results container
          card.append(image);
          skinConcernsResults.append(card);
        } else {
          product.variants.edges.forEach((variantEdge) => {
            const variant = variantEdge.node;
            const card = document.createElement("a");
            const variantId = variant.id.split("/").pop(); // Extract the actual ID
            card.href = `/products/${product.handle}?variant=${variantId}`; // Use the actual ID
            card.className =
              "concerns-section__card concerns-section__card--product embla__slide";

            const info = document.createElement("div");
            info.className = "product-card__info";

            const brand = document.createElement("p");
            brand.className = "all-caps product-card__brand";
            brand.textContent = product.vendor;

            const title = document.createElement("h4");
            title.className = "product-card__product";
            title.textContent = `${product.title} / ${variant.title}`;

            info.append(brand, title);

            // if (
            //   product.vendor.toLowerCase() === "biologique recherche" &&
            //   !isCustomerLoggedIn
            // ) {
            //   const buttonDiv = document.createElement("div");
            //   buttonDiv.className =
            //     "all-caps btn btn--primary product-card__btn product-card__btn--icon";
            //   buttonDiv.dataset.url = `/account/login?checkout_url=/products/${product.handle}?variant=${variantId}`;
            //   buttonDiv.textContent = "Login to Shop";
            //   // Set the href attribute of the parent anchor to the URL in the data-url attribute
            //   card.href = buttonDiv.dataset.url;
            //   card.append(info, buttonDiv);
            // } else {}
            if (
              product.vendor.toLowerCase() === "biologique recherche" &&
              countryCode === "US"
            ) {
              const buttonDiv = document.createElement("div");
              buttonDiv.className =
                "all-caps btn btn--primary product-card__btn product-card__btn--icon";
              buttonDiv.textContent = "Exclusive to Canada";
              // Make the button unclickable by styling it differently
              buttonDiv.style.cursor = "default";
              card.append(info, buttonDiv);
            } else {
              const form = document.createElement("form");
              form.action = "/cart/add";
              form.method = "post";
              form.className = "product-card__form";

              const idInput = document.createElement("input");
              idInput.type = "hidden";
              idInput.name = "id";
              idInput.value = variantId;

              const button = document.createElement("button");
              button.className = "all-caps btn btn--primary product-card__btn";

              const addToBag = document.createElement("span");
              addToBag.textContent = "Add to Bag";

              const price = document.createElement("span");
              const priceData = getPriceDisplay(variant);
              price.textContent = `$${priceData.amount} ${priceData.currencyCode}`;

              button.append(addToBag, price);
              form.append(idInput, button);
              attachEventListenersToProduct(form);

              card.append(info, form);
            }

            // Assuming 'product' is already defined and contains the product information
            // Assuming 'variant' is defined and represents the currently processed variant

            // Select the first variant's value
            const firstVariantValue = variant.selectedOptions[0]?.value
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-"); // Normalize the value by making it lowercase and replacing spaces with '-'

            // Filter product images to find one that matches the criteria
            const matchingImage = product.images.edges.find((edge) => {
              const imageUrl = edge.node.url;
              return (
                imageUrl.includes("product-card") &&
                imageUrl.includes(firstVariantValue)
              );
            });

            // Determine the fallback image source: variant's image, or the product's first image if the variant has no image
            const fallbackImageSrc = variant.image
              ? variant.image.url
              : product.images.edges[0]?.node.url;

            // Use the matching image if found; otherwise, use the fallback image source
            const selectedImageSrc = matchingImage
              ? matchingImage.node.url
              : fallbackImageSrc;

            const image = document.createElement("img");
            image.className = "product-card__image";
            image.src = selectedImageSrc;
            image.width = "780";
            image.height = "1170";
            image.loading = "lazy";

            // Append the image to the card and the card to the results container
            card.append(image);
            skinConcernsResults.append(card);
          });
        }
      });
      // Resume the animation after the data has been loaded and rendered
      animation.play();
    })
    .catch((error) => console.error("Error:", error));
}

const fetchPages = () => {
  const query = `
    {
      pages(first: 50) {
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

  return fetch(`${shopifyStoreUrl}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyStorefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      const pages = data.data.pages.edges
        .map((edge) => edge.node)
        .filter((page) => page.metafield && page.metafield.value === "true");
      return pages;
    });
};

// Function to fetch and display pages
function displayPages(selectedConcern) {
  // Clear the current contents of skinConcernsResults
  skinConcernsResults.innerHTML = "";

  // Start the animation with opacity 0
  gsap.set(skinConcernsResults, { opacity: 0 });

  // Start the animation to opacity 1, but pause it immediately
  const animation = gsap.to(skinConcernsResults, {
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
      // Normalize and filter the pages based on the selected skin concern
      const relatedPages = pages.filter((page) => {
        const normalizedConcerns =
          page.metafields.skin_concerns_treatments.map(normalize);
        return normalizedConcerns.includes(selectedConcern);
      });

      // Check if there are any related pages
      if (relatedPages.length === 0) {
        const message = document.createElement("p");
        message.classList.add("main-body", "concerns-section__empty-res-msg");
        message.textContent =
          "We do not offer any treatments for this skin concern at this time. Please check for relevant products instead.";
        skinConcernsResults.append(message);
        // Resume the animation after the data has been loaded and rendered
        animation.play();
        return;
      }
      relatedPages.forEach((page) => {
        // Normalize the skin concerns before comparing
        const normalizedConcerns =
          page.metafields.skin_concerns_treatments.map(normalize);
        // Check if the page's skin concerns include the selected concern
        if (normalizedConcerns.includes(selectedConcern)) {
          const card = document.createElement("div");
          card.className =
            "concerns-section__card concerns-section__card--treatment embla__slide";

          const info = document.createElement("div");
          info.className = "treatment-card__info";

          const title = document.createElement("h4");
          title.className = "treatment-card__treatment";
          title.textContent = page.title;

          let link;
          if (!page.metafields.booking_link_treatments) {
            link = document.createElement("p");
            link.textContent = "Inquire Now";
            link.classList.add("nurse-led-inquiry-trigger");
            link.className = page.metafields.starting_rate_treatments
              ? "all-caps btn btn--primary treatment-card__btn"
              : "all-caps btn btn--primary treatment-card__btn treatment-card__btn--icon";
            const { open } = createPopup(nurseLedId);
            link.onclick = open;
          } else {
            link = document.createElement("a");
            link.target = "_blank"; // This line makes the link open in a new window
            link.href = page.metafields.booking_link_treatments;
            link.className = page.metafields.starting_rate_treatments
              ? "all-caps btn btn--primary treatment-card__btn"
              : "all-caps btn btn--primary treatment-card__btn treatment-card__btn--icon";
            link.textContent = "Book Now";
          }

          const image = document.createElement("img");
          image.className = "treatment-card__image";
          image.src = page.metafields.featured_image_treatments;
          image.width = "292";
          image.height = "438";
          image.loading = "lazy";

          info.append(title, link);
          card.append(info, image);
          skinConcernsResults.append(card);
        }
      });
      // Resume the animation after the data has been loaded and rendered
      animation.play();
    })
    .catch((error) => console.error("Error:", error));
}

displayResults();

// Add event listener to the products radio button
if (productsRadio) {
  productsRadio.addEventListener("change", function () {
    if (this.checked) {
      displayResults();
    }
  });
}

if (treatmentsRadio) {
  // Add event listener to the treatments radio button
  treatmentsRadio.addEventListener("change", function () {
    if (this.checked) {
      displayResults();
    }
  });
}

const SkinConcernsSection = () => {
  // Check if scrollSelectNode exists
  if (!scrollSelectNode) {
    return;
  }

  let { embla, cleanup, getActiveSlide } = ScrollSelect(
    scrollSelectNode,
    scrollSelectSlides,
    null,
    {}
  );

  // Check if swiperNode exists
  if (swiperNode) {
    SwiperEmbla(swiperViewportNode, progressNode, false);
  }
};

export default SkinConcernsSection;
