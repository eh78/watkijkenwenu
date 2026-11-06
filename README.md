# Wat kijken we nu? (werktitel)

Kies een decennium en een genre, laat de filmrol draaien en krijg een willekeurige film
uit de **top 100 best beoordeelde** films van die combinatie (bron: TMDB).

## Starten

```bash
cp .env.example .env.local   # vul TMDB_READ_TOKEN in (API Read Access Token, v4)
npm install
npm run dev
```

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · TMDB API

## Structuur

```
src/
├── app/
│   ├── page.tsx              # home: decennium + genre → filmrol
│   ├── actions/spin.ts       # Server Action: kiest pool + winnaar
│   └── film/[id]/page.tsx    # resultaatpagina (deelbare URL, metadata/OG)
├── components/
│   ├── picker/               # DecadeDial, GenreSelector, SpinExperience
│   ├── reel/                 # FilmReel (de animatie), PosterCard
│   ├── movie/                # MovieHero, SwipeablePoster, PickActions
│   └── ui/                   # Button, TmdbImage
└── lib/
    ├── constants.ts          # decennia, genres, selectie-instellingen
    ├── pool.ts               # laatste spin in sessionStorage (voor swipen)
    ├── theme.ts              # jaartal → decennium-thema
    └── tmdb/                 # server-only client, gecachete queries, image-helpers, types
```

## Hoe de selectie werkt

1. `discover/movie` met `sort_by=vote_average.desc`, `vote_count.gte=500`, decennium, genre
   en een minimumscore van 6,5 (`vote_average.gte`), zodat kleine genres geen flops opleveren.
   Te weinig resultaten? Dan valt hij terug op `vote_count.gte=100`.
2. Top 100 = 5 pagina's van 20 films. Er wordt één willekeurige pagina opgehaald, en daaruit
   één winnaar. De andere posters vullen de filmrol en zijn "volgende" bij wegswipen.
3. TMDB-responses worden een dag gecachet (`'use cache'` + `cacheLife('days')`).
   Het willekeurig kiezen gebeurt na de cache.

De TMDB-token wordt alleen op de server gebruikt (`server-only`).

## Versie 2 (voorbereid)

- **Streamingdiensten NL**: `getWatchProviders()` in `src/lib/tmdb/movies.ts` is al klaar
  (`/movie/{id}/watch/providers` → `results.NL`). Er moet nog een component komen op de
  resultaatpagina (plek gemarkeerd in `MovieHero.tsx`). Bronvermelding van JustWatch is verplicht.
- **Radarr**: komt in `src/lib/integrations/radarr.ts` (server-only) plus een route handler of
  Server Action. Zet `RADARR_URL` en `RADARR_API_KEY` in `.env.local`.
