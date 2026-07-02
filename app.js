/* ============================================================
   JOYFLIX — app.js
   TMDB API + vidlink.pro integration
   ============================================================ */

'use strict';

if (window.__TAURI_INTERNALS__) {
  document.documentElement.classList.add('tauri');
}


// ── CONFIG ──────────────────────────────────────────────────
const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d'; // public demo key
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/';
const PROVIDER_STORE = 'joyflix_provider';
const LANG_STORE     = 'joyflix_lang';
const LANGS_STORE    = 'joyflix_langs';
const REGION_STORE   = 'joyflix_region';
const WELCOMED_KEY   = 'joyflix_welcomed';

const LANGUAGES = [
  // International
  { code: 'en-US', tmdb: 'en', name: 'English',    flag: '🇺🇸', region: 'US' },
  { code: 'es-ES', tmdb: 'es', name: 'Español',    flag: '🇪🇸', region: 'ES' },
  { code: 'fr-FR', tmdb: 'fr', name: 'Français',   flag: '🇫🇷', region: 'FR' },
  { code: 'de-DE', tmdb: 'de', name: 'Deutsch',    flag: '🇩🇪', region: 'DE' },
  { code: 'ja-JP', tmdb: 'ja', name: '日本語',      flag: '🇯🇵', region: 'JP' },
  { code: 'ko-KR', tmdb: 'ko', name: '한국어',      flag: '🇰🇷', region: 'KR' },
  { code: 'pt-BR', tmdb: 'pt', name: 'Português',  flag: '🇧🇷', region: 'BR' },
  { code: 'it-IT', tmdb: 'it', name: 'Italiano',   flag: '🇮🇹', region: 'IT' },
  { code: 'ar-SA', tmdb: 'ar', name: 'العربية',    flag: '🇸🇦', region: 'SA' },
  { code: 'zh-CN', tmdb: 'zh', name: '中文',        flag: '🇨🇳', region: 'CN' },
  { code: 'ru-RU', tmdb: 'ru', name: 'Русский',    flag: '🇷🇺', region: 'RU' },
  { code: 'tr-TR', tmdb: 'tr', name: 'Türkçe',     flag: '🇹🇷', region: 'TR' },
  { code: 'th-TH', tmdb: 'th', name: 'ภาษาไทย',    flag: '🇹🇭', region: 'TH' },
  { code: 'id-ID', tmdb: 'id', name: 'Indonesia',  flag: '🇮🇩', region: 'ID' },
  // Indian languages
  { code: 'hi-IN', tmdb: 'hi', name: 'हिन्दी',     flag: '🇮🇳', region: 'IN' },
  { code: 'ml-IN', tmdb: 'ml', name: 'മലയാളം',     flag: '🇮🇳', region: 'IN' },
  { code: 'ta-IN', tmdb: 'ta', name: 'தமிழ்',       flag: '🇮🇳', region: 'IN' },
  { code: 'te-IN', tmdb: 'te', name: 'తెలుగు',      flag: '🇮🇳', region: 'IN' },
  { code: 'kn-IN', tmdb: 'kn', name: 'ಕನ್ನಡ',       flag: '🇮🇳', region: 'IN' },
  { code: 'bn-IN', tmdb: 'bn', name: 'বাংলা',       flag: '🇧🇩', region: 'IN' },
  { code: 'mr-IN', tmdb: 'mr', name: 'मराठी',       flag: '🇮🇳', region: 'IN' },
  { code: 'pa-IN', tmdb: 'pa', name: 'ਪੰਜਾਬੀ',      flag: '🇮🇳', region: 'IN' },
  { code: 'gu-IN', tmdb: 'gu', name: 'ગુજરાતી',     flag: '🇮🇳', region: 'IN' },
  { code: 'ur-PK', tmdb: 'ur', name: 'اردو',         flag: '🇵🇰', region: 'PK' },
];

const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'MX', name: 'Mexico' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'TR', name: 'Turkey' },
];

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
let userLangs  = JSON.parse(localStorage.getItem(LANGS_STORE) || '["en-US"]');
let userLang   = userLangs[0];
let userRegion = localStorage.getItem(REGION_STORE) || 'US';

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
const bnHome = $('bnHome');
const bnMovies = $('bnMovies');
const bnTV = $('bnTV');
const bnTrending = $('bnTrending');

// ── UTILS ────────────────────────────────────────────────────
const img = (path, size = 'w500') =>
  path ? `${IMG_BASE}${size}${path}` : null;

const imgFallback = (path, size) =>
  img(path, size) || `https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image`;

const REGION_ENDPOINTS = new Set([
  '/movie/popular', '/movie/top_rated', '/movie/now_playing', '/movie/upcoming',
  '/tv/popular', '/tv/top_rated', '/tv/airing_today', '/tv/on_the_air',
]);

async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', userLang);
  if (REGION_ENDPOINTS.has(endpoint)) url.searchParams.set('region', userRegion);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

function slimItem(item) {
  // WKWebView caps history state at ~640KB — store only what popstate needs
  return {
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    name: item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    genre_ids: item.genre_ids,
  };
}

function pushNav(state) {
  if (_skipPush) return;
  try {
    history.pushState(state, '');
  } catch (e) {
    // State too large (WKWebView limit) — retry with slimmed item
    if (state.item) {
      try { history.pushState({ ...state, item: slimItem(state.item) }, ''); } catch (_) {}
    }
  }
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
  pushNav({ type: 'modal', item: slimItem(item) });
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
  pushNav({ type: 'player', item: slimItem(item) });
  closeModal();
  const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
  currentPlayItem = { item, isTV };
  renderPlayer();
  playerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
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
const _bnMap = { navHome: bnHome, navMovies: bnMovies, navTV: bnTV, navTrending: bnTrending };

function setActiveNavLink(el) {
  [navHome, navMovies, navTV, navTrending].forEach(x => x.classList.remove('active'));
  if (el) el.classList.add('active');
  [bnHome, bnMovies, bnTV, bnTrending].filter(Boolean).forEach(x => x.classList.remove('active'));
  const bnEl = _bnMap[el?.id];
  if (bnEl) bnEl.classList.add('active');
}

function goHome() {
  const onHome = currentTab === 'home';
  const noOverlay = !gridPage.classList.contains('active') && !searchPage.classList.contains('active');
  if (onHome && noOverlay) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  currentGenreId = null;
  switchView('home');
}

navHome.onclick = e => { e.preventDefault(); goHome(); };
navMovies.onclick = e => { e.preventDefault(); currentTab = 'movies'; currentGenreId = null; switchView('movies'); };
navTV.onclick = e => { e.preventDefault(); currentTab = 'tv'; currentGenreId = null; switchView('tv'); };
navTrending.onclick = e => { e.preventDefault(); currentTab = 'trending'; currentGenreId = null; switchView('trending'); };
homeBtn.onclick = e => { e.preventDefault(); goHome(); };
if (bnHome) bnHome.onclick = () => goHome();
if (bnMovies) bnMovies.onclick = () => { currentTab = 'movies'; currentGenreId = null; switchView('movies'); };
if (bnTV) bnTV.onclick = () => { currentTab = 'tv'; currentGenreId = null; switchView('tv'); };
if (bnTrending) bnTrending.onclick = () => { currentTab = 'trending'; currentGenreId = null; switchView('trending'); };

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

function getLangRows(type = 'all') {
  const extraRows = [];
  const langNames = { ml: 'Malayalam', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', pa: 'Punjabi', gu: 'Gujarati',
    ur: 'Urdu', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', th: 'Thai',
    id: 'Indonesian', ar: 'Arabic', ru: 'Russian', tr: 'Turkish', fr: 'French',
    de: 'German', es: 'Spanish', pt: 'Portuguese', it: 'Italian' };

  userLangs.forEach(code => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (!lang || lang.tmdb === 'en') return;
    const label = langNames[lang.tmdb] || lang.name;
    if (type !== 'tv') {
      extraRows.push(
        { title: `${lang.flag} Popular ${label} Movies`,   endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'popularity.desc' } },
        { title: `${lang.flag} Top Rated ${label} Movies`, endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'vote_average.desc', 'vote_count.gte': 50 } },
        { title: `${lang.flag} New ${label} Movies`,       endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'release_date.desc', 'vote_count.gte': 10 } },
      );
    }
    if (type !== 'movie') {
      extraRows.push(
        { title: `${lang.flag} Popular ${label} TV`,       endpoint: D_TV,    params: { with_original_language: lang.tmdb, sort_by: 'popularity.desc' } },
      );
    }
  });
  return extraRows;
}

async function loadRows(tab, genreId) {
  mainContent.innerHTML = '';
  hero.style.display = '';

  const baseRows = ROW_CONFIG[tab] || ROW_CONFIG.home;
  const langRows = tab === 'home' ? getLangRows('all')
                 : tab === 'movies' ? getLangRows('movie')
                 : tab === 'tv' ? getLangRows('tv')
                 : [];
  // Insert language rows after first 2 base rows so they're visible without deep scrolling
  const splitAt = Math.min(2, baseRows.length);
  const rows = langRows.length
    ? [...baseRows.slice(0, splitAt), ...langRows, ...baseRows.slice(splitAt)]
    : baseRows;

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
      hideSearchPage();
      searchInput.value = '';
      searchInput.classList.remove('open');
      searchOpen = false;
      const wasGrid = gridPage.classList.contains('active');
      hideGridPage();
      currentGenreId = null;
      setActiveNavLink($({ home: 'navHome', movies: 'navMovies', tv: 'navTV', trending: 'navTrending' }[tab]));
      buildGenreBar();
      const firstPill = genreBar.querySelector('.genre-pill');
      if (firstPill) firstPill.classList.add('active');
      // Only reload rows if switching tabs or content was replaced by the grid page
      if (currentTab !== tab || wasGrid || mainContent.children.length === 0) {
        currentTab = tab;
        loadRows(tab, null);
      } else {
        currentTab = tab;
      }
    } else if (state.type === 'grid') {
      closePlayer();
      closeModal();
      // Reuse existing grid DOM if the same grid is already loaded
      const sameGrid = gridEndpoint === state.endpoint &&
                       String(gridGenreId) === String(state.genreId ?? null) &&
                       JSON.stringify(gridExtraParams) === JSON.stringify(state.extraParams || {});
      if (sameGrid && gridContent.children.length > 0) {
        showGridPage();
        gridTitle.textContent = state.title;
      } else {
        openGridPage(state.title, state.endpoint, state.genreId, state.extraParams);
      }
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

// ── SETTINGS MODAL ───────────────────────────────────────────
const settingsOv    = $('settings-overlay');
const settingsClose = $('settingsClose');

function renderLangGrid(containerId, selectedCodes, onChange) {
  const grid = $(containerId);
  if (!grid) return;

  const refresh = () => {
    grid.innerHTML = LANGUAGES.map((l, i) => {
      const idx = selectedCodes.indexOf(l.code);
      const sel = idx !== -1;
      const isPrimary = idx === 0;
      return `
        <button class="lang-btn${sel ? ' selected' : ''}" data-code="${l.code}" data-region="${l.region}" data-tmdb="${l.tmdb}">
          ${isPrimary ? '<span class="lang-primary-badge">★</span>' : ''}
          <span class="lang-flag">${l.flag}</span>
          <span class="lang-name">${l.name}</span>
          ${sel ? '<span class="lang-check">✓</span>' : ''}
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const idx  = selectedCodes.indexOf(code);
        if (idx !== -1) {
          if (selectedCodes.length === 1) return; // keep at least 1
          selectedCodes.splice(idx, 1);
        } else {
          selectedCodes.push(code);
        }
        onChange(selectedCodes);
        refresh();
      });
    });
  };

  refresh();
}

function populateSettingsSelects() {
  const regionSel   = $('settingsRegion');
  const providerSel = $('settingsProvider');

  if (regionSel) regionSel.innerHTML = REGIONS.map(r =>
    `<option value="${r.code}">${r.name}</option>`
  ).join('');

  if (providerSel) providerSel.innerHTML = PROVIDERS.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');
}

let _settingsLangs = [];

function openSettings() {
  _settingsLangs = [...userLangs];
  renderLangGrid('settingsLangGrid', _settingsLangs, codes => { _settingsLangs = codes; });
  $('settingsRegion').value   = userRegion;
  $('settingsProvider').value = currentProviderId;
  settingsOv.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  settingsOv.classList.remove('open');
  document.body.style.overflow = '';
}

function saveSettings() {
  const newLangs    = _settingsLangs.length ? _settingsLangs : ['en-US'];
  const newLang     = newLangs[0];
  const newRegion   = $('settingsRegion').value;
  const newProvider = $('settingsProvider').value;

  const langChanged = JSON.stringify(newLangs) !== JSON.stringify(userLangs);
  userLangs         = newLangs;
  userLang          = newLang;
  userRegion        = newRegion;
  currentProviderId = newProvider;

  localStorage.setItem(LANGS_STORE,    JSON.stringify(userLangs));
  localStorage.setItem(LANG_STORE,     userLang);
  localStorage.setItem(REGION_STORE,   userRegion);
  localStorage.setItem(PROVIDER_STORE, currentProviderId);

  if (langChanged) _genreMap = null;

  closeSettings();
  showToast('Settings saved!');

  if (langChanged) {
    mainContent.innerHTML = '';
    loadRows(currentTab, null);
  }
}

if (settingsClose)              settingsClose.onclick = closeSettings;
if ($('saveSettingsBtn'))       $('saveSettingsBtn').onclick = saveSettings;
if ($('settingsBtn'))           $('settingsBtn').onclick = openSettings;
settingsOv?.addEventListener('click', e => { if (e.target === settingsOv) closeSettings(); });

// ── ONBOARDING POPUP ─────────────────────────────────────────
function buildOnboarding() {
  let pickedLangs = [...userLangs];

  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.innerHTML = `
    <div class="onboarding-box">
      <div class="onboarding-logo">
        <i class="ph-fill ph-film-strip"></i> Joy<span>Flix</span>
      </div>
      <h2 class="onboarding-title">Welcome! Choose your languages</h2>
      <p class="onboarding-sub">Select one or more — first pick sets the primary language for titles</p>
      <div class="lang-grid" id="onboardLangGrid"></div>
      <button class="btn-play onboarding-start" id="onboardingStart">
        <i class="ph-fill ph-play"></i> Get Started
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  renderLangGrid('onboardLangGrid', pickedLangs, codes => { pickedLangs = codes; });

  overlay.querySelector('#onboardingStart').addEventListener('click', () => {
    userLangs  = pickedLangs.length ? pickedLangs : ['en-US'];
    userLang   = userLangs[0];
    const prim = LANGUAGES.find(l => l.code === userLang);
    userRegion = prim?.region || 'US';
    localStorage.setItem(LANGS_STORE,  JSON.stringify(userLangs));
    localStorage.setItem(LANG_STORE,   userLang);
    localStorage.setItem(REGION_STORE, userRegion);
    localStorage.setItem(WELCOMED_KEY, '1');
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 400);
    // reload with chosen languages
    _genreMap = null;
    loadRows(currentTab, null);
  });
}

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  history.replaceState({ type: 'tab', tab: 'home' }, '');
  setActiveNavLink(navHome);
  buildGenreBar();
  const firstPill = genreBar.querySelector('.genre-pill');
  if (firstPill) firstPill.classList.add('active');
  populateSettingsSelects();
  if (!localStorage.getItem(WELCOMED_KEY)) buildOnboarding();
  await loadRows('home', null);
}

init().catch(err => {
  console.error('StreamFlix init error:', err);
  showToast('JoyFlix: Failed to load content. Check your TMDB API key.', 5000);
});


// ══════════════════════════════════════════════════════════════
// HORIZONTAL TOUCH DRAG — iOS Safari fallback for row scrollers
// ══════════════════════════════════════════════════════════════

const horizontalTouchState = new WeakMap();

document.addEventListener('touchstart', e => {
  const track = e.target.closest('.slider-track, #genre-bar');
  if (!track || e.touches.length !== 1) return;
  if (track._momentumId) { cancelAnimationFrame(track._momentumId); track._momentumId = null; }
  horizontalTouchState.set(track, {
    startX: e.touches[0].clientX,
    startY: e.touches[0].clientY,
    scrollLeft: track.scrollLeft,
    lock: null,
    lastX: e.touches[0].clientX,
    lastTime: Date.now(),
    velocity: 0,
  });
}, { passive: true });

document.addEventListener('touchmove', e => {
  const track = e.target.closest('.slider-track, #genre-bar');
  if (!track || e.touches.length !== 1) return;
  const state = horizontalTouchState.get(track);
  if (!state) return;
  const dx = e.touches[0].clientX - state.startX;
  const dy = e.touches[0].clientY - state.startY;
  if (state.lock === null) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    state.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  }
  if (state.lock !== 'x' || track.scrollWidth <= track.clientWidth) return;
  e.preventDefault();
  const now = Date.now();
  const dt = now - state.lastTime;
  if (dt > 0) state.velocity = (state.lastX - e.touches[0].clientX) / dt;
  state.lastX = e.touches[0].clientX;
  state.lastTime = now;
  track.scrollLeft = state.scrollLeft - dx;
}, { passive: false });

['touchend', 'touchcancel'].forEach(type => {
  document.addEventListener(type, e => {
    const track = e.target.closest('.slider-track, #genre-bar');
    if (!track) return;
    const state = horizontalTouchState.get(track);
    if (state && state.lock === 'x' && type === 'touchend') {
      let v = state.velocity * 16;
      const step = () => {
        if (Math.abs(v) < 0.5) { track._momentumId = null; return; }
        track.scrollLeft += v;
        v *= 0.92;
        track._momentumId = requestAnimationFrame(step);
      };
      track._momentumId = requestAnimationFrame(step);
    }
    horizontalTouchState.delete(track);
  }, { passive: true });
});

// ══════════════════════════════════════════════════════════════
// WHEEL SCROLL — vertical redirect to horizontal on slider rows
// Two-finger horizontal swipes (deltaX) are intentionally not
// intercepted here — the browser/WKWebView handles them natively
// via overflow-x: scroll, preserving macOS momentum/inertia.
// ══════════════════════════════════════════════════════════════

document.addEventListener('wheel', e => {
  // elementFromPoint is more reliable than e.target in WKWebView (Tauri)
  const el = document.elementFromPoint(e.clientX, e.clientY) || e.target;
  const track = el.closest('.slider-track, #genre-bar');
  if (!track || track.scrollWidth <= track.clientWidth) return;

  const absDx = Math.abs(e.deltaX);
  const absDy = Math.abs(e.deltaY);

  // Primarily horizontal — let native browser/WKWebView scroll handle it
  if (absDx >= absDy) return;

  // Primarily vertical wheel over a slider row — redirect to horizontal
  if (el.closest('.card')) return;  // vertical scroll over a card scrolls the page
  e.preventDefault();
  track.scrollLeft += e.deltaY;
}, { passive: false });

// ══════════════════════════════════════════════════════════════
// POINTER DRAG — mouse/stylus drag for desktop (Tauri / browser)
// ══════════════════════════════════════════════════════════════

let _drag = null;

document.addEventListener('pointerdown', e => {
  const track = e.target.closest('.slider-track, #genre-bar');
  if (!track || e.pointerType === 'touch') return;
  // Don't capture yet — wait for drag threshold so normal clicks still work
  _drag = { track, startX: e.clientX, scrollLeft: track.scrollLeft, pointerId: e.pointerId, active: false };
});

document.addEventListener('pointermove', e => {
  if (!_drag) return;
  const dx = e.clientX - _drag.startX;
  if (!_drag.active) {
    if (Math.abs(dx) < 5) return; // below threshold — still a click
    _drag.active = true;
    _drag.track.setPointerCapture(_drag.pointerId);
    _drag.track.style.cursor = 'grabbing';
    _drag.track.style.userSelect = 'none';
  }
  _drag.track.scrollLeft = _drag.scrollLeft - dx;
});

document.addEventListener('pointerup', () => {
  if (!_drag) return;
  _drag.track.style.cursor = '';
  _drag.track.style.userSelect = '';
  _drag = null;
});

document.addEventListener('pointercancel', () => {
  if (!_drag) return;
  _drag.track.style.cursor = '';
  _drag.track.style.userSelect = '';
  _drag = null;
});
