const facials = document.getElementById('annual-facials-sale');
const shipping = document.getElementById('evergreen-announcement');

const Announcements = () => {
  const currentDate = new Date();
  const targetDate = new Date('2023-09-08T00:00:00');

  if (currentDate >= targetDate) {
    facials.style.display = 'none';
    shipping.style.display = 'block';
  }
};

export default Announcements;
