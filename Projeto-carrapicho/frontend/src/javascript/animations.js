document.addEventListener('DOMContentLoaded', function() {
  const donateButtons = document.querySelectorAll('#btn-doar-nav, #btn-doar-mobile');

  if (donateButtons.length) {
    let active = false;

    setInterval(() => {
      donateButtons.forEach(button => {
        button.style.transition = 'box-shadow 0.5s ease, transform 0.5s ease';
        if (active) {
          button.style.transform = 'translateY(-1px)';
          button.style.boxShadow = '0 14px 28px rgba(0, 168, 89, 0.24)';
        } else {
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 10px 24px rgba(0, 168, 89, 0.16)';
        }
      });
      active = !active;
    }, 2800);
  }
});