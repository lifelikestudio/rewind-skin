const DeduplicateQueryParameters = (queryString) => {
  const params = new URLSearchParams(queryString);
  const deduplicatedParams = {};

  for (const [key, value] of params.entries()) {
    if (deduplicatedParams[key]) {
      deduplicatedParams[key] = [...deduplicatedParams[key], value];
    } else {
      deduplicatedParams[key] = [value];
    }
  }

  const result = new URLSearchParams();
  for (const [key, values] of Object.entries(deduplicatedParams)) {
    values.forEach((value) => {
      result.append(key, value);
    });
  }

  return result.toString();
};

export default DeduplicateQueryParameters;
