const CopyrightYear = () => {
  const currentYear = new Date().getFullYear();
  document.getElementById('copyright-year-mobile').textContent = currentYear;
  document.getElementById('copyright-year-desktop').textContent = currentYear;
};

export default CopyrightYear;
