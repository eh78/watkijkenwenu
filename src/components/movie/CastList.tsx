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
      <ul className="grid grid-cols-5 gap-2 sm:gap-3">
        {cast.map((c) => (
          <li key={c.id} className="min-w-0 text-center">
            <div className="relative mx-auto size-12 overflow-hidden sm:size-16 rounded-full bg-surface ring-1 ring-muted/20">
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
