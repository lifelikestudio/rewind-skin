const SyncCheckboxes = (checkbox) => {
  const checkboxId = checkbox.id;
  let correspondingId;
  if (checkboxId.includes('-mobile-')) {
    correspondingId = checkboxId.replace('-mobile-', '-desktop-');
  } else if (checkboxId.includes('-desktop-')) {
    correspondingId = checkboxId.replace('-desktop-', '-mobile-');
  }

  const correspondingCheckbox = document.getElementById(correspondingId);

  if (correspondingCheckbox) {
    correspondingCheckbox.checked = checkbox.checked;
  }
};

export default SyncCheckboxes;
