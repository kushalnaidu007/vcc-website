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

const playersList = document.getElementById('players-list');
const playerSearch = document.getElementById('player-search');
const playerCount = document.getElementById('player-count');

if (playersList && playerSearch && playerCount) {
  const renderPlayers = (players) => {
    playersList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    players.forEach((player) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.textContent = player.name;
      fragment.appendChild(card);
    });
    playersList.appendChild(fragment);
    playerCount.textContent = `${players.length} players`;
  };

  fetch('assets/data/players.json')
    .then((res) => res.json())
    .then((data) => {
      const players = (data.players || [])
        .filter((p) => p && p.name)
        .map((p) => ({ name: p.name.trim() }))
        .sort((a, b) => a.name.localeCompare(b.name));

      renderPlayers(players);

      playerSearch.addEventListener('input', (event) => {
        const term = event.target.value.trim().toLowerCase();
        const filtered = term
          ? players.filter((p) => p.name.toLowerCase().includes(term))
          : players;
        renderPlayers(filtered);
      });
    })
    .catch(() => {
      playerCount.textContent = 'Unable to load players right now.';
    });
}
