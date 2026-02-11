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

const newsList = document.getElementById('news-list');
const matchesList = document.getElementById('matches-list');

const renderNews = (items) => {
  if (!newsList) return;
  newsList.innerHTML = '';
  if (!items.length) {
    newsList.innerHTML = '<p class="card-meta">No news yet.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'news-card';
    const link = item.link
      ? `<a class="btn btn-outline" href="${item.link}" target="_blank" rel="noopener">Read more</a>`
      : '';
    card.innerHTML =
      `<span class="card-meta">${item.date}</span>` +
      `<h3>${item.title}</h3>` +
      `<p>${item.summary}</p>` +
      link;
    fragment.appendChild(card);
  });
  newsList.appendChild(fragment);
};

const renderMatches = (items) => {
  if (!matchesList) return;
  matchesList.innerHTML = '';
  if (!items.length) {
    matchesList.innerHTML = '<p class="card-meta">No match summaries yet.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'match-card';
    const link = item.link
      ? `<a class="btn btn-outline" href="${item.link}" target="_blank" rel="noopener">View scorecard</a>`
      : '';
    card.innerHTML =
      `<span class="card-meta">${item.date}</span>` +
      `<h3>${item.title}</h3>` +
      `<p><strong>${item.result}</strong></p>` +
      `<p>${item.summary}</p>` +
      link;
    fragment.appendChild(card);
  });
  matchesList.appendChild(fragment);
};


if (newsList) {
  fetch('/api/news')
    .then((res) => res.json())
    .then((data) => renderNews(Array.isArray(data) ? data : []))
    .catch(() => renderNews([]));
}

if (matchesList) {
  fetch('/api/matches')
    .then((res) => res.json())
    .then((data) => renderMatches(Array.isArray(data) ? data : []))
    .catch(() => renderMatches([]));
}

const newsForm = document.getElementById('news-form');
const matchForm = document.getElementById('match-form');
const adminToken = document.getElementById('admin-token');
const newsStatus = document.getElementById('news-status');
const matchStatus = document.getElementById('match-status');

const postItem = async (endpoint, payload, statusEl) => {
  statusEl.textContent = 'Publishing...';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken.value.trim(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Request failed');
    }
    statusEl.textContent = 'Published successfully.';
    statusEl.style.color = 'green';
  } catch (err) {
    statusEl.textContent = 'Failed to publish. Check token and try again.';
    statusEl.style.color = 'crimson';
  }
};

if (newsForm && adminToken && newsStatus) {
  newsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    postItem('/api/news', {
      title: document.getElementById('news-title').value,
      summary: document.getElementById('news-body').value,
      date: document.getElementById('news-date').value,
      link: document.getElementById('news-link').value,
    }, newsStatus);
    newsForm.reset();
  });
}

if (matchForm && adminToken && matchStatus) {
  matchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    postItem('/api/matches', {
      title: document.getElementById('match-title').value,
      summary: document.getElementById('match-body').value,
      date: document.getElementById('match-date').value,
      result: document.getElementById('match-result').value,
      link: document.getElementById('match-link').value,
    }, matchStatus);
    matchForm.reset();
  });
}
