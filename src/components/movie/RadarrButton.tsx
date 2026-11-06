"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { addMovieToRadarr, getRadarrMovieStatus, type RadarrMovieStatus } from "@/app/actions/radarr";

const pill =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Radarr-status en "toevoegen"-knop. Haalt de status pas in de browser op,
 * zodat de filmpagina zelf statisch/gecachet kan blijven.
 */
export function RadarrButton({ tmdbId }: { tmdbId: number }) {
  const [status, setStatus] = useState<RadarrMovieStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, startAdding] = useTransition();

  useEffect(() => {
    let active = true;
    getRadarrMovieStatus(tmdbId).then((s) => active && setStatus(s));
    return () => {
      active = false;
    };
  }, [tmdbId]);

  function onAdd() {
    startAdding(async () => {
      setMessage(null);
      const result = await addMovieToRadarr(tmdbId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setStatus({ configured: true, ok: true, state: "monitored", link: result.link });
      setMessage(result.searching ? "Toegevoegd, Radarr gaat zoeken." : "Toegevoegd aan Radarr.");
    });
  }

  if (!status) return <span className={`${pill} w-44 animate-pulse bg-surface`} aria-hidden>&nbsp;</span>;

  if (!status.configured) {
    return status.canSetup ? (
      <Link href="/instellingen" className={`${pill} border border-dashed border-muted/40 text-muted hover:border-accent hover:text-fg`}>
        <RadarrIcon /> Radarr koppelen
      </Link>
    ) : null;
  }

  if (!status.ok) {
    return (
      <p className="text-sm text-accent-2">
        Radarr: {status.error}{" "}
        <Link href="/instellingen" className="underline">
          Instellingen
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 md:items-start">
      {status.state === "missing" ? (
        <button onClick={onAdd} disabled={adding} className={`${pill} bg-[#ffc230] text-black hover:brightness-110 disabled:opacity-60`}>
          <RadarrIcon /> {adding ? "Toevoegen…" : "Toevoegen aan Radarr"}
        </button>
      ) : (
        <a
          href={status.link ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`${pill} border border-muted/30 text-fg hover:border-accent`}
        >
          <RadarrIcon />
          {status.state === "downloaded" && "In je bibliotheek ✓"}
          {status.state === "monitored" && "In Radarr, wacht op download"}
          {status.state === "unmonitored" && "In Radarr (niet gevolgd)"}
        </a>
      )}
      {message && (
        <p role="status" className="text-xs text-muted">
          {message}
        </p>
      )}
    </div>
  );
}

function RadarrIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
