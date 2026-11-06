/** Decennia waaruit gekozen kan worden. `theme` stuurt de visuele stijl aan. */
export const DECADES = [
  { id: "1970", label: "'70", from: "1970-01-01", to: "1979-12-31", theme: "seventies" },
  { id: "1980", label: "'80", from: "1980-01-01", to: "1989-12-31", theme: "neon" },
  { id: "1990", label: "'90", from: "1990-01-01", to: "1999-12-31", theme: "vhs" },
  { id: "2000", label: "'00", from: "2000-01-01", to: "2009-12-31", theme: "chrome" },
  { id: "2010", label: "'10", from: "2010-01-01", to: "2019-12-31", theme: "clean" },
  { id: "2020", label: "'20", from: "2020-01-01", to: "2029-12-31", theme: "clean" },
] as const;

export type Decade = (typeof DECADES)[number];
export type DecadeId = Decade["id"];
export type DecadeTheme = Decade["theme"];

/** TMDB genre-ID's met Nederlandse labels. */
export const GENRES = [
  { id: 28, label: "Actie" },
  { id: 12, label: "Avontuur" },
  { id: 16, label: "Animatie" },
  { id: 35, label: "Komedie" },
  { id: 80, label: "Misdaad" },
  { id: 18, label: "Drama" },
  { id: 14, label: "Fantasy" },
  { id: 27, label: "Horror" },
  { id: 9648, label: "Mysterie" },
  { id: 10749, label: "Romantiek" },
  { id: 878, label: "Sci-Fi" },
  { id: 53, label: "Thriller" },
  { id: 10752, label: "Oorlog" },
  { id: 37, label: "Western" },
] as const;

export type GenreId = (typeof GENRES)[number]["id"];

export const getDecade = (id: string) => DECADES.find((d) => d.id === id);
export const getGenre = (id: number) => GENRES.find((g) => g.id === id);

/** Selectie-instellingen: "top 100 best beoordeeld" = 5 pagina's van 20. */
export const SELECTION = {
  maxPages: 5,
  /** Minimum aantal stemmen, zodat obscure films met 3× een 10 niet winnen. */
  minVoteCount: 500,
  /** Lagere drempel als een decennium/genre-combinatie te weinig films oplevert. */
  fallbackMinVoteCount: 100,
  /**
   * Minimale score. Veel decennium/genre-combinaties hebben minder dan 100 films
   * met genoeg stemmen; zonder ondergrens zou de "top 100" dan ook flops bevatten.
   */
  minRating: 6.5,
} as const;

/** Taal en regio voor TMDB (regio NL wordt in v2 gebruikt voor watch providers). */
export const TMDB_LOCALE = { language: "nl-NL", fallbackLanguage: "en-US", region: "NL" } as const;

/** Talen die uitgesloten kunnen worden (ISO 639-1, zoals TMDB `original_language`). */
export const LANGUAGES = [
  { code: "en", label: "Engels" },
  { code: "es", label: "Spaans" },
  { code: "fr", label: "Frans" },
  { code: "de", label: "Duits" },
  { code: "it", label: "Italiaans" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Zweeds" },
  { code: "da", label: "Deens" },
  { code: "no", label: "Noors" },
  { code: "pt", label: "Portugees" },
  { code: "ru", label: "Russisch" },
  { code: "tr", label: "Turks" },
  { code: "ja", label: "Japans" },
  { code: "ko", label: "Koreaans" },
  { code: "zh", label: "Chinees (Mandarijn)" },
  { code: "cn", label: "Kantonees" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
] as const;

/** Landen die uitgesloten kunnen worden (ISO 3166-1, zoals TMDB `origin_country`). */
export const COUNTRIES = [
  { code: "US", label: "Verenigde Staten" },
  { code: "GB", label: "Verenigd Koninkrijk" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australië" },
  { code: "FR", label: "Frankrijk" },
  { code: "DE", label: "Duitsland" },
  { code: "IT", label: "Italië" },
  { code: "ES", label: "Spanje" },
  { code: "NL", label: "Nederland" },
  { code: "BE", label: "België" },
  { code: "SE", label: "Zweden" },
  { code: "DK", label: "Denemarken" },
  { code: "NO", label: "Noorwegen" },
  { code: "RU", label: "Rusland" },
  { code: "TR", label: "Turkije" },
  { code: "MX", label: "Mexico" },
  { code: "BR", label: "Brazilië" },
  { code: "AR", label: "Argentinië" },
  { code: "JP", label: "Japan" },
  { code: "KR", label: "Zuid-Korea" },
  { code: "CN", label: "China" },
  { code: "HK", label: "Hongkong" },
  { code: "IN", label: "India" },
  { code: "TH", label: "Thailand" },
] as const;

export interface ExclusionFilters {
  languages: string[];
  countries: string[];
}

export const NO_FILTERS: ExclusionFilters = { languages: [], countries: [] };

/** Alleen bekende codes doorlaten, gesorteerd (stabiele cache-sleutel). */
export function sanitizeFilters(input: unknown): ExclusionFilters {
  const f = (input ?? {}) as Partial<ExclusionFilters>;
  const pick = (values: unknown, allowed: readonly { code: string }[]) =>
    (Array.isArray(values) ? values : []).filter((v): v is string => allowed.some((a) => a.code === v)).sort();
  return { languages: pick(f.languages, LANGUAGES), countries: pick(f.countries, COUNTRIES) };
}
