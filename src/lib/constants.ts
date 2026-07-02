import type { Language, Provider, Region, RowConfig } from './types';

export const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
export const TMDB_BASE = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p/';

export const PROVIDER_STORE = 'joyflix_provider';
export const LANG_STORE = 'joyflix_lang';
export const LANGS_STORE = 'joyflix_langs';
export const REGION_STORE = 'joyflix_region';
export const WELCOMED_KEY = 'joyflix_welcomed';

export const DEFAULT_PROVIDER = 'vidlink';

export const LANGUAGES: Language[] = [
  { code: 'en-US', tmdb: 'en', name: 'English', flag: '🇺🇸', region: 'US' },
  { code: 'es-ES', tmdb: 'es', name: 'Español', flag: '🇪🇸', region: 'ES' },
  { code: 'fr-FR', tmdb: 'fr', name: 'Français', flag: '🇫🇷', region: 'FR' },
  { code: 'de-DE', tmdb: 'de', name: 'Deutsch', flag: '🇩🇪', region: 'DE' },
  { code: 'ja-JP', tmdb: 'ja', name: '日本語', flag: '🇯🇵', region: 'JP' },
  { code: 'ko-KR', tmdb: 'ko', name: '한국어', flag: '🇰🇷', region: 'KR' },
  { code: 'pt-BR', tmdb: 'pt', name: 'Português', flag: '🇧🇷', region: 'BR' },
  { code: 'it-IT', tmdb: 'it', name: 'Italiano', flag: '🇮🇹', region: 'IT' },
  { code: 'ar-SA', tmdb: 'ar', name: 'العربية', flag: '🇸🇦', region: 'SA' },
  { code: 'zh-CN', tmdb: 'zh', name: '中文', flag: '🇨🇳', region: 'CN' },
  { code: 'ru-RU', tmdb: 'ru', name: 'Русский', flag: '🇷🇺', region: 'RU' },
  { code: 'tr-TR', tmdb: 'tr', name: 'Türkçe', flag: '🇹🇷', region: 'TR' },
  { code: 'th-TH', tmdb: 'th', name: 'ภาษาไทย', flag: '🇹🇭', region: 'TH' },
  { code: 'id-ID', tmdb: 'id', name: 'Indonesia', flag: '🇮🇩', region: 'ID' },
  { code: 'hi-IN', tmdb: 'hi', name: 'हिन्दी', flag: '🇮🇳', region: 'IN' },
  { code: 'ml-IN', tmdb: 'ml', name: 'മലയാളം', flag: '🇮🇳', region: 'IN' },
  { code: 'ta-IN', tmdb: 'ta', name: 'தமிழ்', flag: '🇮🇳', region: 'IN' },
  { code: 'te-IN', tmdb: 'te', name: 'తెలుగు', flag: '🇮🇳', region: 'IN' },
  { code: 'kn-IN', tmdb: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'IN' },
  { code: 'bn-IN', tmdb: 'bn', name: 'বাংলা', flag: '🇧🇩', region: 'IN' },
  { code: 'mr-IN', tmdb: 'mr', name: 'मराठी', flag: '🇮🇳', region: 'IN' },
  { code: 'pa-IN', tmdb: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'IN' },
  { code: 'gu-IN', tmdb: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', region: 'IN' },
  { code: 'ur-PK', tmdb: 'ur', name: 'اردو', flag: '🇵🇰', region: 'PK' },
];

export const REGIONS: Region[] = [
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

export const PROVIDERS: Provider[] = [
  {
    id: 'vidlink',
    name: 'VidLink',
    movie: (id) => `https://vidlink.pro/movie/${id}?primaryColor=E50914&autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=E50914&autoplay=true`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&ep=${e}`,
  },
  {
    id: 'videasy',
    name: 'Videasy',
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    movie: (id) => `https://www.vidking.net/embed/movie/${id}`,
    tv: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'moviesclub',
    name: 'MoviesClub',
    movie: (id) => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },
  {
    id: 'nunes',
    name: 'Nunes Network',
    movie: (id) => `https://tmdbplayer.nunesnetwork.com/?type=movie&id=${id}&server=1`,
    tv: (id, s, e) => `https://tmdbplayer.nunesnetwork.com/?type=tv&id=${id}&server=1&s=${s}&e=${e}`,
  },
];

export const ALL_GENRES = [
  { id: null as number | null, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 10762, name: 'Kids' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10764, name: 'Reality' },
  { id: 10768, name: 'War & Politics' },
];

const D_MOVIE = '/discover/movie';
const D_TV = '/discover/tv';

export const ROW_CONFIG: Record<string, RowConfig[]> = {
  home: [
    { title: 'Top 10 This Week', endpoint: '/trending/all/week', top10: true },
    { title: 'Popular Movies', endpoint: '/movie/popular' },
    { title: 'Popular TV Shows', endpoint: '/tv/popular' },
    { title: 'Top Rated Movies', endpoint: '/movie/top_rated' },
    { title: 'Now Playing', endpoint: '/movie/now_playing' },
    { title: 'Upcoming Movies', endpoint: '/movie/upcoming' },
    { title: 'Airing Today', endpoint: '/tv/airing_today' },
    { title: 'Top Rated TV', endpoint: '/tv/top_rated' },
    { title: 'Action Movies', endpoint: D_MOVIE, params: { with_genres: 28 } },
    { title: 'Comedy Movies', endpoint: D_MOVIE, params: { with_genres: 35 } },
    { title: 'Horror Movies', endpoint: D_MOVIE, params: { with_genres: 27 } },
    { title: 'Drama Movies', endpoint: D_MOVIE, params: { with_genres: 18 } },
    { title: 'Sci-Fi Movies', endpoint: D_MOVIE, params: { with_genres: 878 } },
    { title: 'Fantasy Movies', endpoint: D_MOVIE, params: { with_genres: 14 } },
    { title: 'Crime & Thriller', endpoint: D_MOVIE, params: { with_genres: '80,53' } },
    { title: 'Romance Movies', endpoint: D_MOVIE, params: { with_genres: 10749 } },
    { title: 'Animated Films', endpoint: D_MOVIE, params: { with_genres: 16 } },
    { title: 'Family Movies', endpoint: D_MOVIE, params: { with_genres: 10751 } },
    { title: 'Action & Adventure TV', endpoint: D_TV, params: { with_genres: 10759 } },
    { title: 'Sci-Fi & Fantasy TV', endpoint: D_TV, params: { with_genres: 10765 } },
    { title: 'Drama Series', endpoint: D_TV, params: { with_genres: 18 } },
    { title: 'Mystery & Crime TV', endpoint: D_TV, params: { with_genres: '9648,80' } },
    { title: 'Animated Shows', endpoint: D_TV, params: { with_genres: 16 } },
    { title: 'Reality TV', endpoint: D_TV, params: { with_genres: 10764 } },
    { title: 'Highest Rated Movies', endpoint: D_MOVIE, params: { sort_by: 'vote_average.desc', 'vote_count.gte': 5000 } },
  ],
  movies: [
    { title: 'Popular Movies', endpoint: '/movie/popular' },
    { title: 'Top Rated', endpoint: '/movie/top_rated' },
    { title: 'Now Playing', endpoint: '/movie/now_playing' },
    { title: 'Upcoming', endpoint: '/movie/upcoming' },
    { title: 'Action', endpoint: D_MOVIE, params: { with_genres: 28 } },
    { title: 'Comedy', endpoint: D_MOVIE, params: { with_genres: 35 } },
    { title: 'Drama', endpoint: D_MOVIE, params: { with_genres: 18 } },
    { title: 'Horror', endpoint: D_MOVIE, params: { with_genres: 27 } },
    { title: 'Science Fiction', endpoint: D_MOVIE, params: { with_genres: 878 } },
    { title: 'Fantasy', endpoint: D_MOVIE, params: { with_genres: 14 } },
    { title: 'Crime', endpoint: D_MOVIE, params: { with_genres: 80 } },
    { title: 'Thriller', endpoint: D_MOVIE, params: { with_genres: 53 } },
    { title: 'Romance', endpoint: D_MOVIE, params: { with_genres: 10749 } },
    { title: 'Animation', endpoint: D_MOVIE, params: { with_genres: 16 } },
    { title: 'Family', endpoint: D_MOVIE, params: { with_genres: 10751 } },
    { title: 'War & History', endpoint: D_MOVIE, params: { with_genres: '10752,36' } },
    { title: 'Western', endpoint: D_MOVIE, params: { with_genres: 37 } },
    { title: 'Documentary', endpoint: D_MOVIE, params: { with_genres: 99 } },
    { title: 'Highest Rated', endpoint: D_MOVIE, params: { sort_by: 'vote_average.desc', 'vote_count.gte': 5000 } },
  ],
  tv: [
    { title: 'Popular Shows', endpoint: '/tv/popular' },
    { title: 'Top Rated', endpoint: '/tv/top_rated' },
    { title: 'Airing Today', endpoint: '/tv/airing_today' },
    { title: 'On The Air', endpoint: '/tv/on_the_air' },
    { title: 'Action & Adventure', endpoint: D_TV, params: { with_genres: 10759 } },
    { title: 'Comedy Shows', endpoint: D_TV, params: { with_genres: 35 } },
    { title: 'Drama Series', endpoint: D_TV, params: { with_genres: 18 } },
    { title: 'Sci-Fi & Fantasy', endpoint: D_TV, params: { with_genres: 10765 } },
    { title: 'Crime Shows', endpoint: D_TV, params: { with_genres: 80 } },
    { title: 'Mystery', endpoint: D_TV, params: { with_genres: 9648 } },
    { title: 'Animated Shows', endpoint: D_TV, params: { with_genres: 16 } },
    { title: 'Family Shows', endpoint: D_TV, params: { with_genres: 10751 } },
    { title: 'Reality TV', endpoint: D_TV, params: { with_genres: 10764 } },
    { title: 'Kids', endpoint: D_TV, params: { with_genres: 10762 } },
    { title: 'War & Politics', endpoint: D_TV, params: { with_genres: 10768 } },
    { title: 'Documentary', endpoint: D_TV, params: { with_genres: 99 } },
  ],
  trending: [
    { title: 'Top 10 Today', endpoint: '/trending/all/day', top10: true },
    { title: 'Top 10 Movies', endpoint: '/trending/movie/week', top10: true },
    { title: 'Top 10 TV Shows', endpoint: '/trending/tv/week', top10: true },
    { title: 'Trending Today', endpoint: '/trending/all/day' },
    { title: 'Trending This Week', endpoint: '/trending/all/week' },
    { title: 'Trending Movies', endpoint: '/trending/movie/week' },
    { title: 'Trending TV', endpoint: '/trending/tv/week' },
    { title: 'Trending Action', endpoint: D_MOVIE, params: { with_genres: 28, sort_by: 'popularity.desc' } },
    { title: 'Trending Comedy', endpoint: D_MOVIE, params: { with_genres: 35, sort_by: 'popularity.desc' } },
    { title: 'Trending Drama', endpoint: D_TV, params: { with_genres: 18, sort_by: 'popularity.desc' } },
    { title: 'Trending Horror', endpoint: D_MOVIE, params: { with_genres: 27, sort_by: 'popularity.desc' } },
    { title: 'Trending Sci-Fi', endpoint: D_MOVIE, params: { with_genres: 878, sort_by: 'popularity.desc' } },
  ],
};

const LANG_NAMES: Record<string, string> = {
  ml: 'Malayalam', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
  hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', pa: 'Punjabi', gu: 'Gujarati',
  ur: 'Urdu', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', th: 'Thai',
  id: 'Indonesian', ar: 'Arabic', ru: 'Russian', tr: 'Turkish', fr: 'French',
  de: 'German', es: 'Spanish', pt: 'Portuguese', it: 'Italian',
};

export function getLangRows(userLangs: string[], type: 'all' | 'movie' | 'tv' = 'all'): RowConfig[] {
  const extraRows: RowConfig[] = [];

  userLangs.forEach((code) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    if (!lang || lang.tmdb === 'en') return;
    const label = LANG_NAMES[lang.tmdb] || lang.name;
    if (type !== 'tv') {
      extraRows.push(
        { title: `${lang.flag} Popular ${label} Movies`, endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'popularity.desc' } },
        { title: `${lang.flag} Top Rated ${label} Movies`, endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'vote_average.desc', 'vote_count.gte': 50 } },
        { title: `${lang.flag} New ${label} Movies`, endpoint: D_MOVIE, params: { with_original_language: lang.tmdb, sort_by: 'release_date.desc', 'vote_count.gte': 10 } },
      );
    }
    if (type !== 'movie') {
      extraRows.push(
        { title: `${lang.flag} Popular ${label} TV`, endpoint: D_TV, params: { with_original_language: lang.tmdb, sort_by: 'popularity.desc' } },
      );
    }
  });

  return extraRows;
}

export function discoverEndpoint(tab: string): string {
  return tab === 'tv' ? '/discover/tv' : '/discover/movie';
}
