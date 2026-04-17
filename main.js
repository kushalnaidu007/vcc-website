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
  fetch(`/api/news?t=${Date.now()}`, { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      const items = Array.isArray(data) ? data : [];
      renderNews(items.filter((item) => !item.archived));
    })
    .catch(() => renderNews([]));
}

if (matchesList) {
  fetch(`/api/matches?t=${Date.now()}`, { cache: 'no-store' })
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
const newsStatus = document.getElementById('news-status');
const matchStatus = document.getElementById('match-status');
const newsManage = document.getElementById('news-manage');
const matchesManage = document.getElementById('matches-manage');
const adminRoot = document.querySelector('[data-admin-root]');
const adminLoginForm = document.getElementById('admin-login-form');
const adminResetForm = document.getElementById('admin-reset-form');
const adminPasswordForm = document.getElementById('admin-password-form');
const adminResetToggle = document.getElementById('admin-reset-toggle');
const adminResetCancel = document.getElementById('admin-reset-cancel');
const adminLogout = document.getElementById('admin-logout');
const adminAuthStatus = document.getElementById('admin-auth-status');
const adminSession = document.getElementById('admin-session');
const adminUserEmail = document.getElementById('admin-user-email');
const adminContent = document.getElementById('admin-content');
const adminLocked = document.getElementById('admin-locked');

let adminAccessToken = '';
let supabaseClient = null;

const setElementVisible = (element, visible, displayValue = '') => {
  if (!element) return;
  element.hidden = !visible;
  element.style.display = visible ? displayValue : 'none';
};

const getAdminRedirectUrl = () => new URL('/admin.html', window.location.origin).toString();
const initialAdminUrl = window.location.href;
const initialRecoveryMode =
  initialAdminUrl.includes('type=recovery') ||
  initialAdminUrl.includes('/auth/v1/verify') ||
  initialAdminUrl.includes('access_token=');

const isPasswordRecoveryMode = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const search = new URLSearchParams(window.location.search);
  return initialRecoveryMode || hash.get('type') === 'recovery' || search.get('type') === 'recovery';
};

const setAdminRecoveryState = (session = null) => {
  adminAccessToken = session?.access_token || adminAccessToken;
  if (!adminRoot) return;

  adminRoot.dataset.adminState = 'recovery';
  setElementVisible(adminSession, !!session?.user, 'grid');
  setElementVisible(adminContent, false);
  setElementVisible(adminLocked, false);
  setElementVisible(adminLoginForm, false);
  setElementVisible(adminResetForm, false);
  setElementVisible(adminPasswordForm, true, 'grid');
  setElementVisible(adminResetToggle, false);
  setElementVisible(adminResetCancel, false);

  if (adminUserEmail) {
    adminUserEmail.textContent = session?.user?.email ? `Signed in as ${session.user.email}` : '';
  }

  setAdminAuthStatus('Choose a new password for your admin account.');
};

const setAdminAuthStatus = (message, color = '') => {
  if (!adminAuthStatus) return;
  adminAuthStatus.textContent = message || '';
  adminAuthStatus.style.color = color || 'inherit';
};

const setAdminAuthenticatedState = (session) => {
  const user = session?.user || null;
  adminAccessToken = session?.access_token || '';

  if (!adminRoot) return;

  if (isPasswordRecoveryMode()) {
    setAdminRecoveryState(session);
    return;
  }

  adminRoot.dataset.adminState = user ? 'signed-in' : 'signed-out';

  setElementVisible(adminSession, !!user, 'grid');
  setElementVisible(adminContent, !!user, 'grid');
  setElementVisible(adminLocked, !user, 'grid');

  if (adminUserEmail) {
    adminUserEmail.textContent = user?.email ? `Signed in as ${user.email}` : '';
  }

  if (user) {
    setElementVisible(adminLoginForm, false);
    setElementVisible(adminResetForm, false);
    if (!isPasswordRecoveryMode()) {
      setElementVisible(adminPasswordForm, false);
    }
    setElementVisible(adminResetToggle, false);
    setElementVisible(adminResetCancel, false);
    return;
  }

  setElementVisible(adminLoginForm, true, 'grid');
  setElementVisible(adminResetForm, false);
  setElementVisible(adminPasswordForm, false);
  setElementVisible(adminResetToggle, true);
  setElementVisible(adminResetCancel, false);
};

const refreshAdminLists = async () => {
  if (!newsManage || !matchesManage) return;
  const [newsRes, matchesRes] = await Promise.all([
    fetch(`/api/news?t=${Date.now()}`, { cache: 'no-store' }),
    fetch(`/api/matches?t=${Date.now()}`, { cache: 'no-store' }),
  ]);
  if (!newsRes.ok || !matchesRes.ok) return false;
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
        <p class="admin-item-status" aria-live="polite"></p>
      `;
      wrapper.dataset.item = JSON.stringify(item);
      container.appendChild(wrapper);
    });
  };
  renderAdminList(newsManage, newsItems, 'news');
  renderAdminList(matchesManage, matchItems, 'matches');
  return true;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

const refreshAdminListsWithRetry = async () => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const ok = await refreshAdminLists();
    if (ok) return true;
    await wait(600);
  }
  return false;
};

const postItem = async (endpoint, payload, statusEl, messages = {}) => {
  const pendingText = messages.pending || 'Saving...';
  const successText = messages.success || 'Saved successfully.';
  statusEl.textContent = pendingText;
  statusEl.style.color = 'inherit';

  if (!adminAccessToken) {
    statusEl.textContent = 'Failed: Please sign in first.';
    statusEl.style.color = 'crimson';
    return false;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Request failed');
    }
    statusEl.textContent = successText;
    statusEl.style.color = 'green';
    return true;
  } catch (err) {
    statusEl.textContent = `Failed: ${err.message}`;
    statusEl.style.color = 'crimson';
    return false;
  }
};

if (newsForm && newsStatus) {
  newsForm.dataset.editId = '';
  newsForm.addEventListener('submit', async (event) => {
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
    const ok = await postItem(
      '/api/news',
      payload,
      newsStatus,
      newsForm.dataset.editId
        ? { pending: 'Updating news...', success: 'News updated successfully.' }
        : { pending: 'Publishing news...', success: 'News published successfully.' }
    );
    if (ok) {
      newsForm.reset();
      newsForm.dataset.editId = '';
      await refreshAdminListsWithRetry();
    }
  });
}

if (matchForm && matchStatus) {
  matchForm.dataset.editId = '';
  matchForm.addEventListener('submit', async (event) => {
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
    const ok = await postItem(
      '/api/matches',
      payload,
      matchStatus,
      matchForm.dataset.editId
        ? { pending: 'Updating summary...', success: 'Match summary updated successfully.' }
        : { pending: 'Publishing summary...', success: 'Match summary published successfully.' }
    );
    if (ok) {
      matchForm.reset();
      matchForm.dataset.editId = '';
      await refreshAdminListsWithRetry();
    }
  });
}

if (newsManage || matchesManage) {
  document.addEventListener('click', async (event) => {
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
      const itemRow = archiveBtn.closest('.admin-item');
      const rowStatus = itemRow.querySelector('.admin-item-status');
      const type = archiveBtn.dataset.archive;
      const item = JSON.parse(itemRow.dataset.item);
      const shouldArchive = !item.archived;
      rowStatus.textContent = shouldArchive ? 'Archiving item...' : 'Restoring item...';
      rowStatus.style.color = 'inherit';
      archiveBtn.disabled = true;

      window.setTimeout(async () => {
        const ok = await postItem(
          `/api/${type === 'news' ? 'news' : 'matches'}`,
          {
            action: shouldArchive ? 'archive' : 'unarchive',
            id: item.id,
          },
          rowStatus,
          shouldArchive
            ? { pending: 'Archiving item...', success: 'Item archived.' }
            : { pending: 'Restoring item...', success: 'Item unarchived.' }
        );
        archiveBtn.disabled = false;
        if (ok) {
          await nextFrame();
          refreshAdminListsWithRetry();
        }
      }, 0);
      return;
    }

    if (deleteBtn) {
      const itemRow = deleteBtn.closest('.admin-item');
      const rowStatus = itemRow.querySelector('.admin-item-status');
      const type = deleteBtn.dataset.delete;
      const item = JSON.parse(itemRow.dataset.item);

      if (deleteBtn.dataset.confirming !== 'true') {
        deleteBtn.dataset.confirming = 'true';
        deleteBtn.textContent = 'Confirm Delete';
        rowStatus.textContent = 'Click delete again to confirm.';
        rowStatus.style.color = '#a00000';

        window.setTimeout(() => {
          if (deleteBtn.dataset.confirming === 'true') {
            deleteBtn.dataset.confirming = 'false';
            deleteBtn.textContent = 'Delete';
            rowStatus.textContent = '';
            rowStatus.style.color = '';
          }
        }, 5000);
        return;
      }

      deleteBtn.dataset.confirming = 'false';
      deleteBtn.textContent = 'Delete';
      rowStatus.textContent = 'Deleting item...';
      rowStatus.style.color = 'inherit';
      deleteBtn.disabled = true;

      window.setTimeout(async () => {
        const ok = await postItem(
          `/api/${type === 'news' ? 'news' : 'matches'}`,
          {
            action: 'delete',
            id: item.id,
          },
          rowStatus,
          { pending: 'Deleting item...', success: 'Item deleted.' }
        );
        deleteBtn.disabled = false;
        if (ok) {
          itemRow.style.opacity = '0.5';
          await nextFrame();
          refreshAdminListsWithRetry();
        }
      }, 0);
    }
  });
}

const initAdminAuth = async () => {
  if (!adminRoot || !window.supabase) return;

  setAdminAuthStatus('Loading admin login...');

  try {
    const configRes = await fetch('/api/admin-config', { cache: 'no-store' });
    if (!configRes.ok) {
      throw new Error('Supabase config is unavailable.');
    }

    const { supabaseUrl, supabaseAnonKey } = await configRes.json();
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    supabaseClient.auth.onAuthStateChange(async (eventName, session) => {
      if (eventName === 'PASSWORD_RECOVERY' || isPasswordRecoveryMode()) {
        setAdminRecoveryState(session);
        return;
      }

      setAdminAuthenticatedState(session);

      if (session?.user) {
        setAdminAuthStatus('');
        await refreshAdminListsWithRetry();
      } else if (!adminResetForm?.hidden) {
        setAdminAuthStatus('Enter your email to receive a reset link.');
      } else {
        setAdminAuthStatus('Sign in to manage club updates.');
      }
    });

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    setAdminAuthenticatedState(session);

    if (isPasswordRecoveryMode()) {
      setAdminRecoveryState(session);
    } else if (session?.user) {
      setAdminAuthStatus('');
      await refreshAdminListsWithRetry();
    } else {
      setAdminAuthStatus('Sign in to manage club updates.');
    }
  } catch (error) {
    setAdminAuthStatus(error.message || 'Unable to load admin login.', 'crimson');
  }
};

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabaseClient) return;

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    setAdminAuthStatus('Signing in...');

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setAdminAuthStatus(error.message || 'Unable to sign in.', 'crimson');
      return;
    }

    adminLoginForm.reset();
    setAdminAuthStatus('Signed in successfully.', 'green');
  });
}

if (adminResetToggle) {
  adminResetToggle.addEventListener('click', () => {
    if (adminRoot) adminRoot.dataset.adminState = 'reset';
    setElementVisible(adminLoginForm, false);
    setElementVisible(adminResetForm, true, 'grid');
    setElementVisible(adminPasswordForm, false);
    setAdminAuthStatus('Enter your email to receive a reset link.');
    const emailField = document.getElementById('admin-email');
    const resetEmailField = document.getElementById('admin-reset-email');
    if (emailField && resetEmailField && emailField.value.trim()) {
      resetEmailField.value = emailField.value.trim();
    }
  });
}

if (adminResetCancel) {
  adminResetCancel.addEventListener('click', () => {
    if (adminRoot) adminRoot.dataset.adminState = 'signed-out';
    setElementVisible(adminLoginForm, true, 'grid');
    setElementVisible(adminResetForm, false);
    setAdminAuthStatus('Sign in to manage club updates.');
  });
}

if (adminResetForm) {
  adminResetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabaseClient) return;

    const email = document.getElementById('admin-reset-email').value.trim();
    if (!email) {
      setAdminAuthStatus('Enter your email address first.', 'crimson');
      return;
    }

    setAdminAuthStatus('Sending reset link...');

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: getAdminRedirectUrl(),
    });

    if (error) {
      setAdminAuthStatus(error.message || 'Unable to send reset link.', 'crimson');
      return;
    }

    adminResetForm.reset();
    setAdminAuthStatus('Reset link sent. Check your inbox.', 'green');
  });
}

if (adminPasswordForm) {
  adminPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabaseClient) return;

    const nextPassword = document.getElementById('admin-new-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;

    if (nextPassword.length < 8) {
      setAdminAuthStatus('Use at least 8 characters for the new password.', 'crimson');
      return;
    }

    if (nextPassword !== confirmPassword) {
      setAdminAuthStatus('Password confirmation does not match.', 'crimson');
      return;
    }

    setAdminAuthStatus('Updating password...');

    const { error } = await supabaseClient.auth.updateUser({ password: nextPassword });
    if (error) {
      setAdminAuthStatus(error.message || 'Unable to update password.', 'crimson');
      return;
    }

    adminPasswordForm.reset();
    window.history.replaceState({}, document.title, window.location.pathname);
    setAdminAuthStatus('Password updated. You can continue using the admin page.', 'green');
  });
}

if (adminLogout) {
  adminLogout.addEventListener('click', async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setAdminAuthStatus('Signed out.');
  });
}

initAdminAuth();

const contactForm = document.getElementById('contact-form');
const contactFormStatus = document.getElementById('contact-form-status');

if (contactForm && contactFormStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    contactFormStatus.textContent = 'Submitting...';
    contactFormStatus.style.color = 'inherit';
    try {
      const formData = Object.fromEntries(new FormData(contactForm).entries());
      const res = await fetch('/api/contact-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Unable to submit');
      }
      contactFormStatus.textContent = 'Thanks, your message has been sent.';
      contactFormStatus.style.color = 'green';
      contactForm.reset();
    } catch (error) {
      contactFormStatus.textContent = `Failed to submit: ${error.message}`;
      contactFormStatus.style.color = 'crimson';
    }
  });
}

const joinForm = document.getElementById('join-form');
const joinFormStatus = document.getElementById('join-form-status');

if (joinForm && joinFormStatus) {
  joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    joinFormStatus.textContent = 'Submitting...';
    joinFormStatus.style.color = 'inherit';
    try {
      const formData = Object.fromEntries(new FormData(joinForm).entries());
      const res = await fetch('/api/join-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Unable to submit');
      }
      joinFormStatus.textContent = 'Thanks, your registration request has been sent.';
      joinFormStatus.style.color = 'green';
      joinForm.reset();
    } catch (error) {
      joinFormStatus.textContent = `Failed to submit: ${error.message}`;
      joinFormStatus.style.color = 'crimson';
    }
  });
}
