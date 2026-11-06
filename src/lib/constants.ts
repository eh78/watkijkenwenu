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
