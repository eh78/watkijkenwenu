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
    ├── filters.ts            # uitgesloten talen/landen (localStorage)
    ├── seen.ts               # al geziene films (localStorage, worden overgeslagen)
    ├── theme.ts              # jaartal → decennium-thema
    └── tmdb/                 # server-only client, gecachete queries, image-helpers, types
```

## Hoe de selectie werkt

1. `discover/movie` met `sort_by=vote_average.desc`, `vote_count.gte=500`, decennium, genre
   en een minimumscore van 6,5 (`vote_average.gte`), zodat kleine genres geen flops opleveren.
   Te weinig resultaten? Dan valt hij terug op `vote_count.gte=100`.
2. Top 100 = 5 pagina's van 20 films. Er wordt één willekeurige pagina opgehaald, en daaruit
   één winnaar. De andere posters vullen de filmrol en zijn "volgende" bij wegswipen.
3. Films die je al gezien hebt, worden overgeslagen (ook na sluiten van de browser) (over alle genres heen).
   Zit er op een pagina niets nieuws meer tussen, dan probeert hij de andere pagina's. Is alles
   gezien, dan kiest hij toch een film en meldt dat het een herhaling kan zijn. Op het startscherm
   kun je de lijst wissen.
4. **Talen en landen uitsluiten** (startscherm, bewaard in localStorage). TMDB kan niet uitsluiten,
   alleen insluiten, dus de app stuurt alle *andere* taal- en landcodes mee (`with_original_language`,
   `with_origin_country`, lijsten uit `/configuration`). Zo blijft het een echte top 100.
5. TMDB-responses worden een dag gecachet (`'use cache'` + `cacheLife('days')`).
   Het willekeurig kiezen gebeurt na de cache.

De TMDB-token wordt alleen op de server gebruikt (`server-only`).

## Filmpagina

Poster, titel, jaar, speelduur, score, genres, beschrijving, regisseur, de vijf belangrijkste
acteurs (één TMDB-call via `append_to_response=credits`), links naar TMDB en IMDb, en:

- **Waar te zien in Nederland:** streamen, huren en kopen (`/movie/{id}/watch/providers` → `NL`,
  data van JustWatch, met bronvermelding).
- **Radarr:** knop "Toevoegen aan Radarr", of de status als de film er al in staat.

## Radarr koppelen

Via het tandwiel → **Instellingen**: vul het adres (bijv. `http://192.168.1.10:7878`) en de
API-sleutel in (Radarr → Settings → General), test de verbinding, kies kwaliteitsprofiel en map,
en sla op. De instellingen staan in een httpOnly-cookie in je browser; de API-sleutel is niet
leesbaar voor JavaScript en gaat alleen naar de eigen server.

- De verbinding loopt **via de server van deze app**. Draai je de app thuis, dan werkt een adres
  in je thuisnetwerk. Een online gehoste versie (bijv. Vercel) kan je thuisnetwerk meestal niet bereiken.
- In plaats van de instellingenpagina kun je ook `RADARR_URL` en `RADARR_API_KEY` in `.env.local`
  zetten (zie `.env.example`). Die gaan dan voor.
- **Publiek gehost?** Zet `RADARR_UI_SETUP=false`, anders kunnen bezoekers de server naar
  willekeurige adressen laten verbinden.

Code: `src/lib/integrations/radarr.ts` (API-client), `radarr-config.ts` (env/cookie),
`src/app/actions/radarr.ts` (Server Actions), `src/app/instellingen/`.
