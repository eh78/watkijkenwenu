import { TmdbImage } from "@/components/ui/TmdbImage";
import type { CastMember } from "@/lib/tmdb/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
        Hoofdrollen
      </h2>
      <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {cast.map((c) => (
          <li key={c.id} className="w-20 shrink-0 snap-start text-center">
            <div className="relative mx-auto size-16 overflow-hidden rounded-full bg-surface ring-1 ring-muted/20">
              {c.profilePath ? (
                <TmdbImage path={c.profilePath} kind="profile" alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span aria-hidden className="grid h-full place-items-center text-sm font-semibold text-muted">
                  {initials(c.name)}
                </span>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{c.name}</p>
            {c.character && <p className="line-clamp-1 text-[11px] text-muted">{c.character}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
