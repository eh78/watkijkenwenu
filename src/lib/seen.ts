/**
 * Films die de gebruiker deze browsersessie al gezien heeft (sessionStorage).
 * Geldt over alle decennia en genres heen. Alleen client-side gebruiken;
 * voor weergave in React: `useSeenCount()` (hydration-veilig).
 */
import { useSyncExternalStore } from "react";

const KEY = "wkwn:seen";
const EVENT = "wkwn:seen-change";
/** Bovengrens zodat de lijst (die naar de Server Action gaat) klein blijft. */
const MAX = 500;

let cache: { raw: string | null; ids: number[] } = { raw: null, ids: [] };

export function getSeen(): number[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, ids: raw ? (JSON.parse(raw) as number[]) : [] };
    return cache.ids;
  } catch {
    return [];
  }
}

function write(ids: number[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids.slice(-MAX)));
  } catch {
    /* privémodus / quota: dan wordt er niets uitgesloten */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function markSeen(id: number) {
  const ids = getSeen();
  if (!ids.includes(id)) write([...ids, id]);
}

export function clearSeen() {
  write([]);
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useSeenCount() {
  return useSyncExternalStore(
    subscribe,
    () => getSeen().length,
    () => 0,
  );
}
