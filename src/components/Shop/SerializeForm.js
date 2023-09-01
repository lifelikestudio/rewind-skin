const SerializeForm = (formElement) => {
  const formData = new FormData();

  formElement
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      formData.append(checkbox.name, checkbox.value);
    });

  return new URLSearchParams(formData).toString();
};

export default SerializeForm;
