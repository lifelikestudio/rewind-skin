const ProductGrid = (collectionHandle, formData) => {
  const collectionsProductCards = document.querySelectorAll(
    '.collections__products > .product-card'
  );
  collectionsProductCards.forEach(function (card) {
    card.addEventListener('click', function (event) {
      if (!event.target.matches('.btn')) {
        window.location.href = this.dataset.url;
      }
    });
  });
  const queryString = new URLSearchParams(formData).toString();
  const url = `/collections/${collectionHandle}?${queryString}`;

  return fetch(url)
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const parsedData = parser.parseFromString(data, 'text/html');
      return parsedData.querySelector('.collections__products').innerHTML;
    });
};

export default ProductGrid;
