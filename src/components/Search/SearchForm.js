const SearchForm = () => {
  const drawerClearBtn = document.getElementById('search-clear-drawer');
  const drawerSearchInput = document.getElementById('search-input-drawer');
  const themeClearBtn = document.getElementById('search-clear-theme');
  const themeSearchInput = document.getElementById('search-input-theme');

  const inputButtonPairs = [
    [drawerClearBtn, drawerSearchInput],
    [themeClearBtn, themeSearchInput],
  ].filter((pair) => pair.every(Boolean)); // Filter out pairs with null elements

  if (!Array.isArray(inputButtonPairs)) {
    console.error('inputButtonPairs is not an array:', inputButtonPairs);
    return;
  }

  inputButtonPairs.forEach(([clearBtn, searchInput]) => {
    if (!clearBtn || !searchInput) return; // Return if elements are not present

    // Show the button if the field loads with text in it
    if (searchInput.value.length > 0) {
      clearBtn.style.display = 'block';
    }

    searchInput.addEventListener('input', function () {
      const value = this.value;
      inputButtonPairs.forEach(([clearBtn, searchInput]) => {
        searchInput.value = value;
        if (value.length > 0) {
          clearBtn.style.display = 'block';
        } else {
          clearBtn.style.display = 'none';
        }
      });
    });

    clearBtn.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the button's default behavior
      inputButtonPairs.forEach(([clearBtn, searchInput]) => {
        searchInput.value = ''; // Clear the input field
        clearBtn.style.display = 'none';
      });
    });
  });
};

export default SearchForm;
