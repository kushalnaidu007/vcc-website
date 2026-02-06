const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

document.querySelectorAll('[data-gallery-slider]').forEach((slider) => {
  const track = slider.querySelector('.gallery-track');
  const prev = slider.querySelector('.gallery-nav.prev');
  const next = slider.querySelector('.gallery-nav.next');
  if (!track || !prev || !next) return;

  const scrollByCard = () => {
    const first = track.querySelector('img');
    const gap = 12;
    return first ? first.clientWidth + gap : 320;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -scrollByCard(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: scrollByCard(), behavior: 'smooth' });
  });

  let autoTimer = setInterval(() => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextLeft = track.scrollLeft + scrollByCard();
    if (nextLeft >= maxScroll - 2) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollByCard(), behavior: 'smooth' });
    }
  }, 1800);

  slider.addEventListener('mouseenter', () => {
    clearInterval(autoTimer);
  });

  slider.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const nextLeft = track.scrollLeft + scrollByCard();
      if (nextLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollByCard(), behavior: 'smooth' });
      }
    }, 1800);
  });
});
