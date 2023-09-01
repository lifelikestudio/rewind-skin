const loginForm = document.getElementById('login-form-container');
const resetForm = document.getElementById('reset-password-form-container');
const cancelReset = document.getElementById('cancel-reset-password');
const triggerReset = document.getElementById('reset-password-trigger');

const CustomerLogin = () => {
  // Function to handle visibility based on URL hash
  const handleVisibility = () => {
    if (window.location.hash === '#login') {
      loginForm.style.display = 'flex';
      resetForm.style.display = 'none';
    } else if (window.location.hash === '#recover') {
      loginForm.style.display = 'none';
      resetForm.style.display = 'flex';
    }
  };

  // Call the function initially to handle visibility based on the initial URL hash
  handleVisibility();

  // Add event listener for hash change
  window.addEventListener('hashchange', handleVisibility);

  // Add event listener for triggerReset click
  triggerReset.addEventListener('click', () => {
    window.location.hash = 'recover'; // Set URL hash to #recover
  });

  // Add event listener for cancelReset click
  cancelReset.addEventListener('click', () => {
    window.location.hash = 'login'; // Set URL hash back to #login
  });
};

export default CustomerLogin;
