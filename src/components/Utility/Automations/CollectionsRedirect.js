const CollectionsRedirect = () => {
  window.onload = function () {
    if (
      window.location.pathname === '/collections' ||
      window.location.pathname === '/collections/'
    ) {
      window.location.href = '/collections/all';
    }
  };
};

export default CollectionsRedirect;
