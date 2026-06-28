/* ============================================================
   JOYFLIX — app.js
   TMDB API + vidlink.pro integration
   ============================================================ */

'use strict';

// ── CONFIG ──────────────────────────────────────────────────
const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d'; // public demo key
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/';
const PROVIDER_STORE = 'joyflix_provider';

// Ported from github.com/ikku47/stream-it-app (src/lib/providers.ts)
const PROVIDERS = [
  {
    id: 'vidlink',
    name: 'VidLink',
    movie: id => `https://vidlink.pro/movie/${id}?primaryColor=E50914&autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=E50914&autoplay=true`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    movie: id => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&ep=${e}`,
  },
  {
    id: 'videasy',
    name: 'Videasy',
    movie: id => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    movie: id => `https://www.vidking.net/embed/movie/${id}`,
    tv: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    movie: id => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'moviesclub',
    name: 'MoviesClub',
    movie: id => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },
  {
    id: 'nunes',
    name: 'Nunes Network',
    movie: id => `https://tmdbplayer.nunesnetwork.com/?type=movie&id=${id}&server=1`,
    tv: (id, s, e) => `https://tmdbplayer.nunesnetwork.com/?type=tv&id=${id}&server=1&s=${s}&e=${e}`,
  },
];
const DEFAULT_PROVIDER = 'vidlink';

// ── STATE ────────────────────────────────────────────────────
let currentTab = 'home';   // home | movies | tv | trending
let currentGenreId = null;
let searchOpen = false;
let searchTimer = null;
let heroItem = null;
let modalItem = null;
let selectedSeason = 1;
let selectedEpisode = 1;
let totalSeasons = 1;
let totalEpisodes = 1;

// Grid page state
let gridEndpoint = null;
let gridGenreId = null;
let gridExtraParams = {};
let gridCurrentPage = 1;
let gridTotalPages = 1;
let gridLoading = false;

// History API — set true while restoring state so pushNav is a no-op
let _skipPush = false;

// ── DOM REFS ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const navbar = $('navbar');
const heroBg = $('heroBg');
const heroTitle = $('heroTitle');
const heroMeta = $('heroMeta');
const heroOverview = $('heroOverview');
const heroTypeBadge = $('heroTypeBadge');
const heroPlayBtn = $('heroPlayBtn');
const heroInfoBtn = $('heroInfoBtn');
const mainContent = $('main-content');
const genreBar = $('genre-bar');
const modalOverlay = $('modal-overlay');
const modal = $('modal');
const modalClose = $('modalClose');
const modalBackdrop = $('modalBackdrop');
const modalTitle = $('modalTitle');
const modalMeta = $('modalMeta');
const modalOverview = $('modalOverview');
const modalActions = $('modalActions');
const modalGenres = $('modalGenres');
const tvControls = $('tvControls');
const seasonBtns = $('seasonBtns');
const episodeBtns = $('episodeBtns');
const playerOverlay = $('player-overlay');
const playerIframe = $('player-iframe');
const playerBack = $('playerBack');
const playerTitle = $('playerTitle');
const searchInput = $('searchInput');
const searchToggle = $('searchToggle');
const searchPage = $('search-results-page');
const searchGrid = $('searchGrid');
const searchLabel = $('searchQueryLabel');
const toast = $('toast');
const navHome = $('navHome');
const navMovies = $('navMovies');
const navTV = $('navTV');
const navTrending = $('navTrending');
const homeBtn = $('homeBtn');
const hero = $('hero');
const gridPage = $('grid-page');
const gridContent = $('gridContent');
const gridTitle = $('gridTitle');
const gridBack = $('gridBack');
const gridSentinel = $('gridSentinel');

// ── UTILS ────────────────────────────────────────────────────
const img = (path, size = 'w500') =>
  path ? `${IMG_BASE}${size}${path}` : null;

const imgFallback = (path, size) =>
  img(path, size) || `https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image`;

async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

function pushNav(state) {
  if (!_skipPush) history.pushState(state, '');
}

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

function scoreColor(score) {
  if (score >= 7.5) return '#46d369';
  if (score >= 6) return '#f5c518';
  return '#e74c3c';
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).getFullYear();
}

// ── SCROLLBAR / NAVBAR ───────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── HERO ─────────────────────────────────────────────────────
function setHero(item) {
  heroItem = item;
  const isTV = item.media_type === 'tv' || !item.title;
  const title = item.title || item.name || 'Unknown';
  const overview = item.overview || '';
  const score = (item.vote_average || 0).toFixed(1);
  const year = formatDate(item.release_date || item.first_air_date);
  const bgPath = img(item.backdrop_path, 'original');

  if (bgPath) {
    heroBg.style.backgroundImage = `url(${bgPath})`;
    heroBg.style.opacity = '1';
  }
  heroTitle.textContent = title;
  heroOverview.textContent = overview;
  heroTypeBadge.innerHTML = isTV
    ? `<i class="ph-fill ph-television-simple"></i> TV SHOW`
    : `<i class="ph-fill ph-film-slate"></i> MOVIE`;

  heroMeta.innerHTML = `
    <span class="hero-score" style="color:${scoreColor(parseFloat(score))}">★ ${score}</span>
    ${year ? `<span>${year}</span>` : ''}
    ${item.adult ? `<span class="modal-badge">18+</span>` : `<span class="modal-badge">${isTV ? 'TV' : 'PG'}</span>`}
  `;

  heroPlayBtn.onclick = () => playItem(item);
  heroInfoBtn.onclick = () => openModal(item);
}

// ── ROWS ─────────────────────────────────────────────────────
function createRow(title, items, endpoint, params = {}) {
  if (!items || !items.length) return;
  const section = document.createElement('section');
  section.className = 'row-section';

  if (endpoint) {
    section.dataset.endpoint = endpoint;
    if (Object.keys(params).length) section.dataset.params = JSON.stringify(params);
  }

  section.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">${title}</h2>
      ${endpoint ? `<button class="row-see-all">See all ›</button>` : ''}
    </div>
    <div class="slider-track-outer">
      <div class="slider-track"></div>
    </div>
  `;

  const track = section.querySelector('.slider-track');
  items.forEach(item => {
    const card = createCard(item);
    track.appendChild(card);
  });

  mainContent.appendChild(section);
}

function createTop10Row(title, items, endpoint, params = {}) {
  const top10 = items.slice(0, 10);
  if (!top10.length) return;

  const section = document.createElement('section');
  section.className = 'row-section';
  if (endpoint) {
    section.dataset.endpoint = endpoint;
    if (Object.keys(params).length) section.dataset.params = JSON.stringify(params);
  }

  section.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">${title}</h2>
      ${endpoint ? `<button class="row-see-all">See all ›</button>` : ''}
    </div>
    <div class="slider-track-outer">
      <div class="slider-track"></div>
    </div>
  `;

  const track = section.querySelector('.slider-track');
  top10.forEach((item, i) => {
    const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
    const typed = { ...item, media_type: isTV ? 'tv' : 'movie' };

    const wrapper = document.createElement('div');
    wrapper.className = 'top10-item';

    const rank = document.createElement('span');
    rank.className = 'top10-rank';
    rank.textContent = i + 1;

    wrapper.appendChild(rank);
    wrapper.appendChild(createCard(typed));
    track.appendChild(wrapper);
  });

  mainContent.appendChild(section);
}

function createSkeletonRow(title, count = 16) {
  const section = document.createElement('section');
  section.className = 'row-section';
  section.innerHTML = `
    <div class="row-header">
      <h2 class="row-title">${title}</h2>
    </div>
    <div class="slider-track-outer">
      <div class="slider-track">
        ${Array.from({ length: count }, () =>
    `<div class="card-skeleton"><div class="skeleton-box"></div></div>`
  ).join('')}
      </div>
    </div>
  `;
  return section;
}

function createCard(item, inGrid = false) {
  const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
  const title = item.title || item.name || '—';
  const score = (item.vote_average || 0).toFixed(1);
  const year = formatDate(item.release_date || item.first_air_date);
  const poster = imgFallback(item.poster_path, 'w342');
  const scoreC = scoreColor(parseFloat(score));

  const wrapper = document.createElement(inGrid ? 'div' : 'div');
  wrapper.className = inGrid ? 'card' : 'card';
  wrapper.tabIndex = 0;

  wrapper.innerHTML = `
    <div class="card-img-wrap">
      <img src="${poster}" alt="${title}" loading="lazy" />
      <div class="card-overlay">
        <button class="card-play-btn" aria-label="Play ${title}">
          <i class="ph-fill ph-play" style="margin-left:2px"></i>
        </button>
        <div class="card-title">${title}</div>
        ${year ? `<div class="card-year">${year}</div>` : ''}
      </div>
      <div class="card-rating" style="color:${scoreC}">★ ${score}</div>
    </div>
  `;

  // play button
  const playBtn = wrapper.querySelector('.card-play-btn');
  playBtn.addEventListener('click', e => {
    e.stopPropagation();
    playItem({ ...item, media_type: isTV ? 'tv' : 'movie' });
  });

  // whole card → open modal
  wrapper.addEventListener('click', () => {
    openModal({ ...item, media_type: isTV ? 'tv' : 'movie' });
  });

  return wrapper;
}

// ── MODAL ────────────────────────────────────────────────────
async function openModal(item) {
  pushNav({ type: 'modal', item });
  modalItem = item;
  const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
  const type = isTV ? 'tv' : 'movie';
  const title = item.title || item.name || '—';
  const score = (item.vote_average || 0).toFixed(1);
  const year = formatDate(item.release_date || item.first_air_date);
  const scoreC = scoreColor(parseFloat(score));

  modalTitle.textContent = title;
  modalOverview.textContent = item.overview || 'No description available.';

  const backdrop = img(item.backdrop_path, 'w1280') || imgFallback(item.poster_path);
  modalBackdrop.src = backdrop;

  modalMeta.innerHTML = `
    <span class="modal-score-badge" style="color:${scoreC}">★ ${score}</span>
    ${year ? `<span>${year}</span>` : ''}
    <span class="modal-badge">${isTV ? 'TV Show' : 'Movie'}</span>
    ${item.adult ? `<span class="modal-badge">18+</span>` : ''}
  `;

  // Genre chips
  modalGenres.innerHTML = '';
  if (item.genre_ids && item.genre_ids.length) {
    const genreMap = await getGenreMap();
    item.genre_ids.slice(0, 6).forEach(id => {
      if (genreMap[id]) {
        const chip = document.createElement('span');
        chip.className = 'genre-chip';
        chip.textContent = genreMap[id];
        modalGenres.appendChild(chip);
      }
    });
  }

  // TV controls
  selectedSeason = 1;
  selectedEpisode = 1;
  if (isTV) {
    tvControls.style.display = 'block';
    totalSeasons = item.number_of_seasons || 1;
    totalEpisodes = 1;

    // Fetch details to know episode counts
    try {
      const details = await tmdb(`/tv/${item.id}`);
      totalSeasons = details.number_of_seasons || 1;
      renderSeasonBtns(totalSeasons);
      await updateEpisodeBtns(item.id, 1);
    } catch {
      renderSeasonBtns(totalSeasons);
      renderEpisodeBtns(12);
    }
  } else {
    tvControls.style.display = 'none';
  }

  // Actions
  modalActions.innerHTML = `
    <button class="btn-play" id="modalPlayBtn">
      <i class="ph-fill ph-play"></i> Play
    </button>
    <button class="btn-info" id="modalTrailerBtn">
      <i class="ph ph-youtube-logo"></i> Trailer
    </button>
  `;
  $('modalPlayBtn').onclick = () => {
    closeModal();
    playItem({ ...item, media_type: type });
  };
  $('modalTrailerBtn').onclick = () => openTrailer(item.id, type);

  // Show
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderSeasonBtns(count) {
  seasonBtns.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const b = document.createElement('button');
    b.className = `num-btn${i === selectedSeason ? ' active' : ''}`;
    b.textContent = i;
    b.onclick = async () => {
      selectedSeason = i;
      selectedEpisode = 1;
      document.querySelectorAll('#seasonBtns .num-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      if (modalItem) await updateEpisodeBtns(modalItem.id, i);
    };
    seasonBtns.appendChild(b);
  }
}

async function updateEpisodeBtns(tvId, season) {
  episodeBtns.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0"></div>';
  try {
    const data = await tmdb(`/tv/${tvId}/season/${season}`);
    totalEpisodes = (data.episodes || []).length || 12;
  } catch {
    totalEpisodes = 12;
  }
  renderEpisodeBtns(totalEpisodes);
}

function renderEpisodeBtns(count) {
  episodeBtns.innerHTML = '';
  const max = Math.min(count, 30);
  for (let i = 1; i <= max; i++) {
    const b = document.createElement('button');
    b.className = `num-btn${i === selectedEpisode ? ' active' : ''}`;
    b.textContent = i;
    b.onclick = () => {
      selectedEpisode = i;
      document.querySelectorAll('#episodeBtns .num-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    };
    episodeBtns.appendChild(b);
  }
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modalBackdrop.src = ''; }, 400);
}

modalClose.onclick = () => history.back();
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) history.back(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (playerOverlay.classList.contains('open') || modalOverlay.classList.contains('open')) history.back();
});

// ── TRAILER ───────────────────────────────────────────────────
async function openTrailer(id, type) {
  try {
    const data = await tmdb(`/${type}/${id}/videos`);
    const trailer = (data.results || []).find(v =>
      v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    } else {
      showToast('No trailer available');
    }
  } catch {
    showToast('Could not load trailer');
  }
}

// ── PLAYER ───────────────────────────────────────────────────
let currentPlayItem = null;
let currentProviderId = localStorage.getItem(PROVIDER_STORE) || DEFAULT_PROVIDER;

function getProvider() {
  return PROVIDERS.find(p => p.id === currentProviderId) || PROVIDERS[0];
}

function renderPlayer() {
  if (!currentPlayItem) return;
  const { item, isTV } = currentPlayItem;
  const title = item.title || item.name || '';
  const provider = getProvider();

  const url = isTV
    ? provider.tv(item.id, selectedSeason, selectedEpisode)
    : provider.movie(item.id);

  playerIframe.src = url;
  playerTitle.textContent = isTV
    ? `${title} — S${selectedSeason} E${selectedEpisode}`
    : title;
}

function playItem(item) {
  pushNav({ type: 'player', item });
  const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
  currentPlayItem = { item, isTV };

  renderPlayer();

  playerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  closeModal();
}

function closePlayer() {
  playerOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentPlayItem = null;
  // Small delay to avoid audio continuing
  setTimeout(() => { playerIframe.src = ''; }, 400);
}

playerBack.onclick = () => history.back();

const playerProviderSelect = $('playerProviderSelect');
if (playerProviderSelect) {
  playerProviderSelect.innerHTML = PROVIDERS.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');
  playerProviderSelect.value = currentProviderId;

  playerProviderSelect.addEventListener('change', () => {
    currentProviderId = playerProviderSelect.value;
    localStorage.setItem(PROVIDER_STORE, currentProviderId);
    renderPlayer();
  });
}

// ── SEARCH ───────────────────────────────────────────────────
searchToggle.addEventListener('click', () => {
  searchOpen = !searchOpen;
  searchInput.classList.toggle('open', searchOpen);
  if (searchOpen) searchInput.focus();
  else {
    searchInput.value = '';
    hideSearchPage();
  }
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  if (q.length < 2) { hideSearchPage(); return; }
  searchTimer = setTimeout(() => doSearch(q), 420);
});

async function doSearch(q) {
  showSearchPage(q);
  searchGrid.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await tmdb('/search/multi', { query: q });
    const items = (data.results || []).filter(i =>
      (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path
    );
    searchGrid.innerHTML = '';
    if (!items.length) {
      searchGrid.innerHTML = '<p style="color:var(--text-mute);grid-column:1/-1">No results found.</p>';
      return;
    }
    items.forEach(item => {
      searchGrid.appendChild(createCard(item, true));
    });
  } catch {
    searchGrid.innerHTML = '<p style="color:var(--text-mute);grid-column:1/-1">Search failed. Check your connection.</p>';
  }
}

function showSearchPage(q) {
  searchLabel.textContent = `"${q}"`;
  hero.style.display = 'none';
  mainContent.style.display = 'none';
  genreBar.style.display = 'none';
  gridPage.classList.remove('active');
  searchPage.classList.add('active');
}

function hideSearchPage() {
  searchPage.classList.remove('active');
  if (!gridPage.classList.contains('active')) {
    hero.style.display = '';
    mainContent.style.display = '';
    genreBar.style.display = '';
  }
}

// ── GENRE CACHE ──────────────────────────────────────────────
let _genreMap = null;
async function getGenreMap() {
  if (_genreMap) return _genreMap;
  try {
    const [m, t] = await Promise.all([
      tmdb('/genre/movie/list'),
      tmdb('/genre/tv/list'),
    ]);
    _genreMap = {};
    [...(m.genres || []), ...(t.genres || [])].forEach(g => { _genreMap[g.id] = g.name; });
  } catch { _genreMap = {}; }
  return _genreMap;
}

// ── GENRE FILTER BAR ─────────────────────────────────────────
const ALL_GENRES = [
  { id: null,  name: 'All' },
  { id: 28,    name: 'Action' },
  { id: 12,    name: 'Adventure' },
  { id: 16,    name: 'Animation' },
  { id: 35,    name: 'Comedy' },
  { id: 80,    name: 'Crime' },
  { id: 99,    name: 'Documentary' },
  { id: 18,    name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14,    name: 'Fantasy' },
  { id: 36,    name: 'History' },
  { id: 27,    name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648,  name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878,   name: 'Sci-Fi' },
  { id: 53,    name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37,    name: 'Western' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 10762, name: 'Kids' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10764, name: 'Reality' },
  { id: 10768, name: 'War & Politics' },
];

function discoverEndpoint() {
  return currentTab === 'tv' ? '/discover/tv' : '/discover/movie';
}

function buildGenreBar() {
  genreBar.innerHTML = '';
  ALL_GENRES.forEach(g => {
    const pill = document.createElement('button');
    pill.className = `genre-pill${g.id === currentGenreId ? ' active' : ''}`;
    pill.textContent = g.name;
    pill.dataset.genreId = g.id ?? '';
    pill.onclick = () => {
      currentGenreId = g.id;
      document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (g.id === null) {
        hideGridPage();
        loadRows(currentTab, null);
      } else {
        openGridPage(g.name, discoverEndpoint(), g.id);
      }
    };
    genreBar.appendChild(pill);
  });
}

// ── TABS ─────────────────────────────────────────────────────
function setActiveNavLink(el) {
  [navHome, navMovies, navTV, navTrending].forEach(x => x.classList.remove('active'));
  el.classList.add('active');
}

navHome.onclick = e => { e.preventDefault(); currentTab = 'home'; currentGenreId = null; switchView('home'); };
navMovies.onclick = e => { e.preventDefault(); currentTab = 'movies'; currentGenreId = null; switchView('movies'); };
navTV.onclick = e => { e.preventDefault(); currentTab = 'tv'; currentGenreId = null; switchView('tv'); };
navTrending.onclick = e => { e.preventDefault(); currentTab = 'trending'; currentGenreId = null; switchView('trending'); };
homeBtn.onclick = e => { e.preventDefault(); currentTab = 'home'; currentGenreId = null; switchView('home'); };

function switchView(tab) {
  currentTab = tab;
  setActiveNavLink($({ home: 'navHome', movies: 'navMovies', tv: 'navTV', trending: 'navTrending' }[tab]));
  hideSearchPage();
  hideGridPage();
  searchInput.value = '';
  searchInput.classList.remove('open');
  searchOpen = false;
  pushNav({ type: 'tab', tab });
  loadRows(tab, null);
  currentGenreId = null;
  buildGenreBar();
  genreBar.querySelector('.genre-pill').classList.add('active');
}

// ── ROW DEFINITIONS ──────────────────────────────────────────
const D_MOVIE = '/discover/movie';
const D_TV    = '/discover/tv';

const ROW_CONFIG = {
  home: [
    { title: 'Top 10 This Week',       endpoint: '/trending/all/week',   top10: true },
    { title: 'Popular Movies',         endpoint: '/movie/popular' },
    { title: 'Popular TV Shows',       endpoint: '/tv/popular' },
    { title: 'Top Rated Movies',       endpoint: '/movie/top_rated' },
    { title: 'Now Playing',            endpoint: '/movie/now_playing' },
    { title: 'Upcoming Movies',        endpoint: '/movie/upcoming' },
    { title: 'Airing Today',           endpoint: '/tv/airing_today' },
    { title: 'Top Rated TV',           endpoint: '/tv/top_rated' },
    { title: 'Action Movies',          endpoint: D_MOVIE, params: { with_genres: 28 } },
    { title: 'Comedy Movies',          endpoint: D_MOVIE, params: { with_genres: 35 } },
    { title: 'Horror Movies',          endpoint: D_MOVIE, params: { with_genres: 27 } },
    { title: 'Drama Movies',           endpoint: D_MOVIE, params: { with_genres: 18 } },
    { title: 'Sci-Fi Movies',          endpoint: D_MOVIE, params: { with_genres: 878 } },
    { title: 'Fantasy Movies',         endpoint: D_MOVIE, params: { with_genres: 14 } },
    { title: 'Crime & Thriller',       endpoint: D_MOVIE, params: { with_genres: '80,53' } },
    { title: 'Romance Movies',         endpoint: D_MOVIE, params: { with_genres: 10749 } },
    { title: 'Animated Films',         endpoint: D_MOVIE, params: { with_genres: 16 } },
    { title: 'Family Movies',          endpoint: D_MOVIE, params: { with_genres: 10751 } },
    { title: 'Action & Adventure TV',  endpoint: D_TV,    params: { with_genres: 10759 } },
    { title: 'Sci-Fi & Fantasy TV',    endpoint: D_TV,    params: { with_genres: 10765 } },
    { title: 'Drama Series',           endpoint: D_TV,    params: { with_genres: 18 } },
    { title: 'Mystery & Crime TV',     endpoint: D_TV,    params: { with_genres: '9648,80' } },
    { title: 'Animated Shows',         endpoint: D_TV,    params: { with_genres: 16 } },
    { title: 'Reality TV',             endpoint: D_TV,    params: { with_genres: 10764 } },
    { title: 'Highest Rated Movies',   endpoint: D_MOVIE, params: { sort_by: 'vote_average.desc', 'vote_count.gte': 5000 } },
  ],
  movies: [
    { title: 'Popular Movies',   endpoint: '/movie/popular' },
    { title: 'Top Rated',        endpoint: '/movie/top_rated' },
    { title: 'Now Playing',      endpoint: '/movie/now_playing' },
    { title: 'Upcoming',         endpoint: '/movie/upcoming' },
    { title: 'Action',           endpoint: D_MOVIE, params: { with_genres: 28 } },
    { title: 'Comedy',           endpoint: D_MOVIE, params: { with_genres: 35 } },
    { title: 'Drama',            endpoint: D_MOVIE, params: { with_genres: 18 } },
    { title: 'Horror',           endpoint: D_MOVIE, params: { with_genres: 27 } },
    { title: 'Science Fiction',  endpoint: D_MOVIE, params: { with_genres: 878 } },
    { title: 'Fantasy',          endpoint: D_MOVIE, params: { with_genres: 14 } },
    { title: 'Crime',            endpoint: D_MOVIE, params: { with_genres: 80 } },
    { title: 'Thriller',         endpoint: D_MOVIE, params: { with_genres: 53 } },
    { title: 'Romance',          endpoint: D_MOVIE, params: { with_genres: 10749 } },
    { title: 'Animation',        endpoint: D_MOVIE, params: { with_genres: 16 } },
    { title: 'Family',           endpoint: D_MOVIE, params: { with_genres: 10751 } },
    { title: 'War & History',    endpoint: D_MOVIE, params: { with_genres: '10752,36' } },
    { title: 'Western',          endpoint: D_MOVIE, params: { with_genres: 37 } },
    { title: 'Documentary',      endpoint: D_MOVIE, params: { with_genres: 99 } },
    { title: 'Highest Rated',    endpoint: D_MOVIE, params: { sort_by: 'vote_average.desc', 'vote_count.gte': 5000 } },
  ],
  tv: [
    { title: 'Popular Shows',        endpoint: '/tv/popular' },
    { title: 'Top Rated',            endpoint: '/tv/top_rated' },
    { title: 'Airing Today',         endpoint: '/tv/airing_today' },
    { title: 'On The Air',           endpoint: '/tv/on_the_air' },
    { title: 'Action & Adventure',   endpoint: D_TV, params: { with_genres: 10759 } },
    { title: 'Comedy Shows',         endpoint: D_TV, params: { with_genres: 35 } },
    { title: 'Drama Series',         endpoint: D_TV, params: { with_genres: 18 } },
    { title: 'Sci-Fi & Fantasy',     endpoint: D_TV, params: { with_genres: 10765 } },
    { title: 'Crime Shows',          endpoint: D_TV, params: { with_genres: 80 } },
    { title: 'Mystery',              endpoint: D_TV, params: { with_genres: 9648 } },
    { title: 'Animated Shows',       endpoint: D_TV, params: { with_genres: 16 } },
    { title: 'Family Shows',         endpoint: D_TV, params: { with_genres: 10751 } },
    { title: 'Reality TV',           endpoint: D_TV, params: { with_genres: 10764 } },
    { title: 'Kids',                 endpoint: D_TV, params: { with_genres: 10762 } },
    { title: 'War & Politics',       endpoint: D_TV, params: { with_genres: 10768 } },
    { title: 'Documentary',          endpoint: D_TV, params: { with_genres: 99 } },
  ],
  trending: [
    { title: 'Top 10 Today',           endpoint: '/trending/all/day',      top10: true },
    { title: 'Top 10 Movies',          endpoint: '/trending/movie/week',   top10: true },
    { title: 'Top 10 TV Shows',        endpoint: '/trending/tv/week',      top10: true },
    { title: 'Trending Today',         endpoint: '/trending/all/day' },
    { title: 'Trending This Week',     endpoint: '/trending/all/week' },
    { title: 'Trending Movies',        endpoint: '/trending/movie/week' },
    { title: 'Trending TV',            endpoint: '/trending/tv/week' },
    { title: 'Trending Action',     endpoint: D_MOVIE, params: { with_genres: 28, sort_by: 'popularity.desc' } },
    { title: 'Trending Comedy',     endpoint: D_MOVIE, params: { with_genres: 35, sort_by: 'popularity.desc' } },
    { title: 'Trending Drama',      endpoint: D_TV,    params: { with_genres: 18, sort_by: 'popularity.desc' } },
    { title: 'Trending Horror',     endpoint: D_MOVIE, params: { with_genres: 27, sort_by: 'popularity.desc' } },
    { title: 'Trending Sci-Fi',     endpoint: D_MOVIE, params: { with_genres: 878, sort_by: 'popularity.desc' } },
  ],
};

async function loadRows(tab, genreId) {
  mainContent.innerHTML = '';
  hero.style.display = '';

  const rows = ROW_CONFIG[tab] || ROW_CONFIG.home;

  // Skeleton placeholders
  rows.forEach(r => {
    const s = createSkeletonRow(r.title);
    mainContent.appendChild(s);
  });

  // Fetch all rows in parallel (2 pages each = ~40 items per row)
  const fetches = rows.map(async (r) => {
    const base = { ...(r.params || {}) };
    try {
      const [d1, d2] = await Promise.all([
        tmdb(r.endpoint, { ...base, page: 1 }),
        tmdb(r.endpoint, { ...base, page: 2 }),
      ]);
      let items = [...(d1.results || []), ...(d2.results || [])].filter(i => i.poster_path);
      items = items.map(i => ({ ...i, media_type: i.media_type || (i.first_air_date ? 'tv' : 'movie') }));
      return { title: r.title, items, endpoint: r.endpoint, params: r.params || {}, top10: !!r.top10 };
    } catch {
      return { title: r.title, items: [], endpoint: r.endpoint, params: r.params || {}, top10: !!r.top10 };
    }
  });

  const results = await Promise.all(fetches);

  // Set hero from first row
  if (results[0] && results[0].items.length) {
    const pick = results[0].items[Math.floor(Math.random() * Math.min(5, results[0].items.length))];
    setHero(pick);
  }

  // Replace skeletons with real rows
  mainContent.innerHTML = '';
  results.forEach(r => {
    if (!r.items.length) return;
    if (r.top10) createTop10Row(r.title, r.items, r.endpoint, r.params);
    else createRow(r.title, r.items, r.endpoint, r.params);
  });
}

// ── GRID PAGE (See All + Infinite Scroll) ────────────────────
function showGridPage() {
  hero.style.display = 'none';
  mainContent.style.display = 'none';
  genreBar.style.display = 'none';
  searchPage.classList.remove('active');
  gridPage.classList.add('active');
  window.scrollTo(0, 0);
}

function hideGridPage() {
  gridPage.classList.remove('active');
  hero.style.display = '';
  mainContent.style.display = '';
  genreBar.style.display = '';
  window.removeEventListener('scroll', onGridScroll);
}

function onGridScroll() {
  if (gridLoading || gridCurrentPage > gridTotalPages) return;
  const distFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  if (distFromBottom < 500) loadNextGridPage();
}

async function loadNextGridPage() {
  if (gridLoading || gridCurrentPage > gridTotalPages) return;
  gridLoading = true;
  gridSentinel.innerHTML = '<div class="spinner"></div>';

  const params = { ...gridExtraParams, page: gridCurrentPage };
  if (gridGenreId) params.with_genres = gridGenreId;

  try {
    const data = await tmdb(gridEndpoint, params);
    gridTotalPages = Math.min(data.total_pages || 1, 500);
    let items = (data.results || []).filter(i => i.poster_path);
    items = items.map(i => ({ ...i, media_type: i.media_type || (i.first_air_date ? 'tv' : 'movie') }));
    items.forEach(item => gridContent.appendChild(createCard(item, true)));
    gridCurrentPage++;
  } catch {
    gridSentinel.innerHTML = '<p style="color:var(--text-mute);padding:1rem">Failed to load more.</p>';
  } finally {
    gridLoading = false;
    gridSentinel.innerHTML = gridCurrentPage > gridTotalPages ? '' : '';
  }
}

async function openGridPage(title, endpoint, genreId, extraParams = {}) {
  pushNav({ type: 'grid', title, endpoint, genreId: genreId || null, extraParams });
  gridEndpoint = endpoint;
  gridGenreId = genreId || null;
  gridExtraParams = extraParams;
  gridCurrentPage = 1;
  gridTotalPages = 500;
  gridLoading = false;
  gridTitle.textContent = title;
  gridContent.innerHTML = '<div class="spinner"></div>';
  gridSentinel.innerHTML = '';
  showGridPage();
  window.removeEventListener('scroll', onGridScroll);

  // Load pages 1 + 2 immediately for ~40 items on first view
  gridLoading = true;
  const base = { ...gridExtraParams, ...(gridGenreId ? { with_genres: gridGenreId } : {}) };
  try {
    const [d1, d2] = await Promise.all([
      tmdb(gridEndpoint, { ...base, page: 1 }),
      tmdb(gridEndpoint, { ...base, page: 2 }),
    ]);
    gridTotalPages = Math.min(d1.total_pages || 1, 500);
    gridContent.innerHTML = '';
    [...(d1.results || []), ...(d2.results || [])]
      .filter(i => i.poster_path)
      .map(i => ({ ...i, media_type: i.media_type || (i.first_air_date ? 'tv' : 'movie') }))
      .forEach(item => gridContent.appendChild(createCard(item, true)));
    gridCurrentPage = 3;
  } catch {
    gridContent.innerHTML = '<p style="color:var(--text-mute);grid-column:1/-1">Failed to load.</p>';
  } finally {
    gridLoading = false;
  }

  window.addEventListener('scroll', onGridScroll, { passive: true });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.row-see-all');
  if (!btn) return;
  const section = btn.closest('[data-endpoint]');
  if (!section) return;
  const rowTitle = section.querySelector('.row-title')?.textContent || '';
  const extraParams = section.dataset.params ? JSON.parse(section.dataset.params) : {};
  openGridPage(rowTitle, section.dataset.endpoint, null, extraParams);
});

gridBack.addEventListener('click', () => history.back());

// ── HISTORY NAVIGATION ───────────────────────────────────────
window.addEventListener('popstate', e => {
  const state = e.state;
  _skipPush = true;
  try {
    if (!state || state.type === 'tab') {
      const tab = state?.tab || 'home';
      closePlayer();
      closeModal();
      currentTab = tab;
      setActiveNavLink($({ home: 'navHome', movies: 'navMovies', tv: 'navTV', trending: 'navTrending' }[tab]));
      hideSearchPage();
      hideGridPage();
      searchInput.value = '';
      searchInput.classList.remove('open');
      searchOpen = false;
      loadRows(tab, null);
      currentGenreId = null;
      buildGenreBar();
      genreBar.querySelector('.genre-pill').classList.add('active');
    } else if (state.type === 'grid') {
      closePlayer();
      closeModal();
      openGridPage(state.title, state.endpoint, state.genreId, state.extraParams);
    } else if (state.type === 'modal') {
      closePlayer();
      openModal(state.item);
    } else if (state.type === 'player') {
      playItem(state.item);
    }
  } finally {
    _skipPush = false;
  }
});

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  history.replaceState({ type: 'tab', tab: 'home' }, '');
  buildGenreBar();
  genreBar.querySelector('.genre-pill').classList.add('active');
  await loadRows('home', null);
}

init().catch(err => {
  console.error('StreamFlix init error:', err);
  showToast('JoyFlix: Failed to load content. Check your TMDB API key.', 5000);
});


// ══════════════════════════════════════════════════════════════
// HORIZONTAL ROW SCROLL — vertical wheel → horizontal scroll
// ══════════════════════════════════════════════════════════════

document.addEventListener('wheel', e => {
  if (e.target.closest('.card')) return; // let cards pass through to vertical page scroll
  const track = e.target.closest('.slider-track, #genre-bar');
  if (!track) return;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  if (track.scrollWidth <= track.clientWidth) return;
  e.preventDefault();
  track.scrollLeft += e.deltaY;
}, { passive: false });
