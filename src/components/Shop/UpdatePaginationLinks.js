const UpdatePaginationLinks = (queryString) => {
  const pagination = document.querySelector('.pagination');
  if (pagination) {
    pagination.querySelectorAll('a').forEach((link) => {
      const originalHref = new URL(
        link.getAttribute('href'),
        window.location.origin
      );
      const originalSearchParams = new URLSearchParams(originalHref.search);
      const newSearchParams = new URLSearchParams(queryString);

      // Remove existing filter parameters from the original search params
      for (const key of newSearchParams.keys()) {
        originalSearchParams.delete(key);
      }

      // Append the new query parameters to the original search params
      for (const [key, value] of newSearchParams.entries()) {
        originalSearchParams.append(key, value);
      }

      // Construct the new href with the updated search params
      originalHref.search = originalSearchParams.toString();
      link.setAttribute('href', originalHref.toString());
    });
  }
};

export default UpdatePaginationLinks;
