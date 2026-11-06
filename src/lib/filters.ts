/**
 * Uitgesloten talen en landen, bewaard in localStorage (blijft staan na sluiten
 * van de browser). Alleen client-side gebruiken; in React via `useFilters()`.
 */
import { useSyncExternalStore } from "react";
import { NO_FILTERS, sanitizeFilters, type ExclusionFilters } from "@/lib/constants";

const KEY = "wkwn:filters";
const EVENT = "wkwn:filters-change";

let cache: { raw: string | null; value: ExclusionFilters } = { raw: null, value: NO_FILTERS };

export function getFilters(): ExclusionFilters {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, value: raw ? sanitizeFilters(JSON.parse(raw)) : NO_FILTERS };
    return cache.value;
  } catch {
    return NO_FILTERS;
  }
}

export function setFilters(filters: ExclusionFilters) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sanitizeFilters(filters)));
  } catch {
    /* privémodus: filters gelden dan niet */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleFilter(kind: keyof ExclusionFilters, code: string) {
  const current = getFilters();
  const list = current[kind].includes(code) ? current[kind].filter((c) => c !== code) : [...current[kind], code];
  setFilters({ ...current, [kind]: list });
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFilters() {
  return useSyncExternalStore(subscribe, getFilters, () => NO_FILTERS);
}
