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
    const preview =
      item.summary && item.summary.length > 180
        ? `${item.summary.slice(0, 180)}...`
        : item.summary;
    card.innerHTML =
      `<span class="card-meta">${item.date}</span>` +
      `<h3>${item.title}</h3>` +
      `<p><strong>${item.result}</strong></p>` +
      `<p>${preview || ''}</p>` +
      `<button class="btn btn-outline" type="button" data-open-modal>Read more</button>` +
      link;
    card.dataset.fullSummary = item.summary || '';
    card.dataset.title = item.title || '';
    card.dataset.date = item.date || '';
    card.dataset.result = item.result || '';
    card.dataset.link = item.link || '';
    fragment.appendChild(card);
  });
  matchesList.appendChild(fragment);
};


if (newsList) {
  fetch('/api/news')
    .then((res) => res.json())
    .then((data) => {
      const items = Array.isArray(data) ? data : [];
      renderNews(items.filter((item) => !item.archived));
    })
    .catch(() => renderNews([]));
}

if (matchesList) {
  fetch('/api/matches')
    .then((res) => res.json())
    .then((data) => {
      const items = Array.isArray(data) ? data : [];
      renderMatches(items.filter((item) => !item.archived));
    })
    .catch(() => renderMatches([]));
}

const setupCarousel = (name) => {
  const track = document.querySelector(`[data-carousel="${name}"]`);
  const prev = document.querySelector(`[data-carousel-prev="${name}"]`);
  const next = document.querySelector(`[data-carousel-next="${name}"]`);
  if (!track || !prev || !next) return;

  const scrollByCard = () => {
    const first = track.querySelector('*');
    const gap = 20;
    return first ? first.clientWidth + gap : 300;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -scrollByCard() * 3, behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: scrollByCard() * 3, behavior: 'smooth' });
  });
};

setupCarousel('news');
setupCarousel('matches');

const modal = document.getElementById('match-modal');
if (modal) {
  const titleEl = document.getElementById('match-modal-title');
  const metaEl = document.getElementById('match-modal-meta');
  const bodyEl = document.getElementById('match-modal-body');
  const linkEl = document.getElementById('match-modal-link');

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  document.addEventListener('click', (event) => {
    const openBtn = event.target.closest('[data-open-modal]');
    if (openBtn) {
      const card = openBtn.closest('.match-card');
      if (!card) return;
      titleEl.textContent = card.dataset.title;
      metaEl.textContent = `${card.dataset.date} • ${card.dataset.result}`;
      bodyEl.textContent = card.dataset.fullSummary;
      if (card.dataset.link) {
        linkEl.style.display = 'inline-flex';
        linkEl.href = card.dataset.link;
      } else {
        linkEl.style.display = 'none';
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      return;
    }
    if (event.target.matches('[data-modal-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

const newsForm = document.getElementById('news-form');
const matchForm = document.getElementById('match-form');
const adminToken = document.getElementById('admin-token');
const newsStatus = document.getElementById('news-status');
const matchStatus = document.getElementById('match-status');
const newsManage = document.getElementById('news-manage');
const matchesManage = document.getElementById('matches-manage');

const refreshAdminLists = async () => {
  if (!newsManage || !matchesManage) return;
  const [newsRes, matchesRes] = await Promise.all([fetch('/api/news'), fetch('/api/matches')]);
  const newsItems = (await newsRes.json()) || [];
  const matchItems = (await matchesRes.json()) || [];
  const renderAdminList = (container, items, type) => {
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = '<p class="admin-meta">No items yet.</p>';
      return;
    }
    items.forEach((item) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'admin-item';
      wrapper.innerHTML = `
        <div>
          <strong>${item.title}</strong>
          <div class="admin-meta">${item.date}${item.archived ? ' • Archived' : ''}</div>
        </div>
        <div class="admin-actions">
          <button class="primary" data-edit="${type}" data-id="${item.id}">Edit</button>
          <button class="archive" data-archive="${type}" data-id="${item.id}">${item.archived ? 'Unarchive' : 'Archive'}</button>
          <button class="danger" data-delete="${type}" data-id="${item.id}">Delete</button>
        </div>
      `;
      wrapper.dataset.item = JSON.stringify(item);
      container.appendChild(wrapper);
    });
  };
  renderAdminList(newsManage, newsItems, 'news');
  renderAdminList(matchesManage, matchItems, 'matches');
};


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
  newsForm.dataset.editId = '';
  newsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById('news-title').value,
      summary: document.getElementById('news-body').value,
      date: document.getElementById('news-date').value,
      link: document.getElementById('news-link').value,
    };
    if (newsForm.dataset.editId) {
      payload.action = 'update';
      payload.id = newsForm.dataset.editId;
    }
    postItem('/api/news', payload, newsStatus).then(refreshAdminLists);
    newsForm.reset();
    newsForm.dataset.editId = '';
  });
}

if (matchForm && adminToken && matchStatus) {
  matchForm.dataset.editId = '';
  matchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      title: document.getElementById('match-title').value,
      summary: document.getElementById('match-body').value,
      date: document.getElementById('match-date').value,
      result: document.getElementById('match-result').value,
      link: document.getElementById('match-link').value,
    };
    if (matchForm.dataset.editId) {
      payload.action = 'update';
      payload.id = matchForm.dataset.editId;
    }
    postItem('/api/matches', payload, matchStatus).then(refreshAdminLists);
    matchForm.reset();
    matchForm.dataset.editId = '';
  });
}

if (newsManage || matchesManage) {
  refreshAdminLists();

  document.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit]');
    const archiveBtn = event.target.closest('[data-archive]');
    const deleteBtn = event.target.closest('[data-delete]');

    if (editBtn) {
      const type = editBtn.dataset.edit;
      const item = JSON.parse(editBtn.closest('.admin-item').dataset.item);
      if (type === 'news') {
        document.getElementById('news-title').value = item.title || '';
        document.getElementById('news-body').value = item.summary || '';
        document.getElementById('news-date').value = item.date || '';
        document.getElementById('news-link').value = item.link || '';
        newsForm.dataset.editId = item.id;
      } else {
        document.getElementById('match-title').value = item.title || '';
        document.getElementById('match-body').value = item.summary || '';
        document.getElementById('match-date').value = item.date || '';
        document.getElementById('match-result').value = item.result || '';
        document.getElementById('match-link').value = item.link || '';
        matchForm.dataset.editId = item.id;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (archiveBtn) {
      const type = archiveBtn.dataset.archive;
      const item = JSON.parse(archiveBtn.closest('.admin-item').dataset.item);
      postItem(`/api/${type === 'news' ? 'news' : 'matches'}`, {
        action: item.archived ? 'unarchive' : 'archive',
        id: item.id,
      }, type === 'news' ? newsStatus : matchStatus).then(refreshAdminLists);
      return;
    }

    if (deleteBtn) {
      const type = deleteBtn.dataset.delete;
      const item = JSON.parse(deleteBtn.closest('.admin-item').dataset.item);
      if (!confirm('Delete this item?')) return;
      postItem(`/api/${type === 'news' ? 'news' : 'matches'}`, {
        action: 'delete',
        id: item.id,
      }, type === 'news' ? newsStatus : matchStatus).then(refreshAdminLists);
    }
  });
}
