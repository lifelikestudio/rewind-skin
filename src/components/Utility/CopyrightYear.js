const CopyrightYear = () => {
  const currentYear = new Date().getFullYear();
  const mobileElement = document.getElementById('copyright-year-mobile');
  const desktopElement = document.getElementById('copyright-year-desktop');

  if (mobileElement) mobileElement.textContent = currentYear;
  if (desktopElement) desktopElement.textContent = currentYear;
};

export default CopyrightYear;
