import { gsap } from 'gsap';
import SerializeForm from '../Shop/SerializeForm';
import SyncCheckboxes from '../Shop/SyncCheckboxes';
import DeduplicateQueryParameters from '../Shop/DeduplicateQueryParameters';
import UpdatePaginationLinks from '../Shop/UpdatePaginationLinks';
import { openDrawer, closeDrawer } from '../Drawers/DrawerHandlers';
import {
  drawerCart,
  setupFiltersCategoriesMobileDrawer,
  setupFiltersConcernsMobileDrawer,
  setupFiltersTypesMobileDrawer,
  setupFiltersBrandsMobileDrawer,
  setupCategoriesDrawerElements,
  setupConcernsDrawerElements,
  setupTypesDrawerElements,
  setupBrandsDrawerElements,
} from '../Drawers/Drawers.js';
import { updateCart } from '../Drawers/CartDrawer.js';
import { attachEventListeners } from '../Drawers/CartDrawer';

const SearchResults = () => {
  const collectionsProductsElement = document.querySelector(
    '.search-results__products'
  );
  // setup product card click event
  if (collectionsProductsElement) {
    collectionsProductsElement.addEventListener('click', function (event) {
      const iconButton = event.target.closest('.product-card__btn--icon');
      if (iconButton) {
        event.preventDefault();
        const dataUrl = iconButton.getAttribute('data-url');
        window.location.href = `/account/login?checkout_url=${dataUrl}`;
      }
    });
  }

  const setupCheckboxes = () => {
    document
      .querySelectorAll('.search-results__filter-form input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
          SyncCheckboxes(this);

          // Get the .collections__container element
          const productGridContainer = document.querySelector(
            '.search-results__container:last-child'
          );
          // Add a loading class to the .collections__container element
          productGridContainer.classList.add('loading');

          const formElement = this.closest('.search-results__filter-form');
          const queryString = SerializeForm(formElement);
          const deduplicatedQueryString =
            DeduplicateQueryParameters(queryString);

          document.querySelector('.pagination').dataset.queryString =
            deduplicatedQueryString;

          const searchTerm = encodeURIComponent(
            document.querySelector('#search-input-theme').value
          );
          const type = 'type=product%2Cpage';
          const options =
            'options%5Bunavailable_products%5D=hide&options%5Bprefix%5D=last';

          // Get the filter values from the checkboxes
          let filters = Array.from(
            formElement.querySelectorAll('input[type="checkbox"]:checked')
          )
            .map(
              (checkbox) =>
                `${checkbox.name}=${encodeURIComponent(checkbox.value)}`
            )
            .join('&');

          let url = `/search?q=${searchTerm}&${type}&${options}`;

          if (filters) {
            url += `&${filters}`;
          }

          // Disable all form inputs
          document
            .querySelectorAll(
              '.search-results__filter-form input[type="checkbox"]'
            )
            .forEach((input) => {
              input.disabled = true;
            });

          $.ajax({
            url: url,
            success: async (data) => {
              // Remove the loading class from the .collections__container element
              productGridContainer.classList.remove('loading');

              // Re-enable all form inputs
              document
                .querySelectorAll(
                  '.search-results__filter-form input[type="checkbox"]'
                )
                .forEach((input) => {
                  input.disabled = false;
                });
              const parsedData = $.parseHTML(data);
              const newProductGrid = $(parsedData)
                .find('.search-results__products')
                .html();

              const newFormHTMLDesktop = $(parsedData)
                .find('.search-results__filter-form--desktop')
                .html();
              // Get the new HTML for each individual drawer
              const newCategoriesMenuHTML = $(parsedData)
                .find('#filters-categories-menu .drawer__menu')
                .html();

              const newConcernsMenuHTML = $(parsedData)
                .find('#filters-concerns-menu .drawer__menu')
                .html();

              const newTypesMenuHTML = $(parsedData)
                .find('#filters-types-menu .drawer__menu')
                .html();

              const newBrandsMenuHTML = $(parsedData)
                .find('#filters-brands-menu .drawer__menu')
                .html();

              const productGridElement = $('.search-results__products');
              productGridElement.html(newProductGrid);

              $('.search-results__filter-form--desktop').html(
                newFormHTMLDesktop
              );

              // Replace the innerHTML of each individual drawer
              $('#filters-categories-menu .drawer__menu').html(
                newCategoriesMenuHTML
              );
              setupCategoriesDrawerElements(); // Call the setup function for elements within the drawer

              $('#filters-concerns-menu .drawer__menu').html(
                newConcernsMenuHTML
              );
              setupConcernsDrawerElements(); // Call the setup function for elements within the drawer

              $('#filters-types-menu .drawer__menu').html(newTypesMenuHTML);
              setupTypesDrawerElements(); // Call the setup function for elements within the drawer

              $('#filters-brands-menu .drawer__menu').html(newBrandsMenuHTML);
              setupBrandsDrawerElements(); // Call the setup function for elements within the drawer

              // Start the animation with opacity 0
              gsap.set(productGridElement, { opacity: 0 });

              // Animate to opacity 1
              gsap.to(productGridElement, { opacity: 1, duration: 0.5 });

              window.history.pushState(null, null, url);
              UpdatePaginationLinks(deduplicatedQueryString);

              // Delay re-attachment of event listeners to 'add to cart' buttons
              setTimeout(() => {
                const addToCart = document.querySelectorAll(
                  'form[action="/cart/add"]'
                );
                addToCart.forEach((form) => {
                  form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    // Submit form with AJAX
                    await fetch('/cart/add', {
                      method: 'post',
                      body: new FormData(form),
                    });
                    // Update cart without page reload
                    await updateCart();
                    // Open cart drawer
                    openDrawer(drawerCart);
                  });
                });
                attachEventListeners();
              }, 0);
              // Re-setup checkboxes and specific drawers after loading new products
              setupCheckboxes();
              setupFiltersCategoriesMobileDrawer();
              setupFiltersConcernsMobileDrawer();
              setupFiltersTypesMobileDrawer();
              setupFiltersBrandsMobileDrawer();
            },
            error: function () {
              // Handle error here

              // Re-enable all form inputs
              document
                .querySelectorAll(
                  '.search-results__filter-form input[type="checkbox"]'
                )
                .forEach((input) => {
                  input.disabled = false;
                });
              // Remove the loading class from the .collections__container element in case of error
              productGridContainer.classList.remove('loading');
            },
          });
        });
      });
  };

  // Call setupCheckboxes initially
  setupCheckboxes();
};

export default SearchResults;
