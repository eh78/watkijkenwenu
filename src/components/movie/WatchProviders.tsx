import { TmdbImage } from "@/components/ui/TmdbImage";
import { getWatchProviders } from "@/lib/tmdb/movies";
import type { TmdbProvider } from "@/lib/tmdb/types";

const GROUPS = [
  { key: "flatrate", label: "Streamen" },
  { key: "rent", label: "Huren" },
  { key: "buy", label: "Kopen" },
] as const;

/**
 * Waar is de film in Nederland te zien? Data van JustWatch via TMDB.
 * JustWatch vereist bronvermelding; de link gaat naar de TMDB-kijkpagina
 * (TMDB levert geen directe deeplinks per dienst).
 */
export async function WatchProviders({ id }: { id: number }) {
  const providers = await getWatchProviders(id).catch(() => null);
  const groups = GROUPS.map((g) => ({ ...g, items: providers?.[g.key] ?? [] })).filter((g) => g.items.length > 0);

  return (
    <section aria-labelledby="watch-heading" className="rounded-xl border border-muted/20 bg-surface/60 p-4">
      <h2 id="watch-heading" className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
        Waar te zien in Nederland
      </h2>

      {groups.length === 0 ? (
        <p className="text-sm text-muted">Op dit moment niet te streamen, huren of kopen in Nederland.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g.key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm text-muted">{g.label}</span>
              <ul className="flex flex-wrap gap-2">
                {[...g.items]
                  .sort((a, b) => a.display_priority - b.display_priority)
                  .slice(0, 8)
                  .map((p) => (
                    <ProviderLogo key={p.provider_id} provider={p} href={providers!.link} />
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted">
        Bron: <a href="https://www.justwatch.com/nl" target="_blank" rel="noopener noreferrer" className="underline">JustWatch</a>
      </p>
    </section>
  );
}

function ProviderLogo({ provider, href }: { provider: TmdbProvider; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={provider.provider_name}
        className="block overflow-hidden rounded-lg ring-1 ring-muted/20 transition hover:scale-105 hover:ring-accent"
      >
        <TmdbImage path={provider.logo_path} kind="logo" alt={provider.provider_name} width={40} height={40} />
      </a>
    </li>
  );
}

export function WatchProvidersSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl bg-surface/60" />;
}
