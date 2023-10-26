import { createPopup as createPopupTypeform } from '@typeform/embed';
import '@typeform/embed/build/css/popup.css';

export const createPopup = createPopupTypeform;
export const nurseLedId = 'CGpmjy66';

const emailOptInId = 'tl5Yq476';
let emailOptInTrigger;
if (document.querySelector('#email-opt-in-trigger')) {
  emailOptInTrigger = document.querySelector('#email-opt-in-trigger');
}

const contactId = 'Q0sNd4TP';
const contactTrigger = document.querySelector('#contact-trigger');

const emailOptInPopUp = () => {
  if (emailOptInTrigger) {
    const { open } = createPopup(emailOptInId);
    emailOptInTrigger.onclick = open;
  }
};

const contactPopUp = () => {
  const { open } = createPopup(contactId);
  contactTrigger.onclick = open;
};

const Forms = () => {
  emailOptInPopUp();
  contactPopUp();
};

export default Forms;
