"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { COUNTRIES, LANGUAGES, NO_FILTERS, type ExclusionFilters } from "@/lib/constants";
import { setFilters, toggleFilter, useFilters } from "@/lib/filters";

const labelOf = (list: readonly { code: string; label: string }[], code: string) => list.find((i) => i.code === code)?.label ?? code;

/** Inklapbaar paneel om talen en landen uit te sluiten. */
export function FilterPanel() {
  const filters = useFilters();
  const [open, setOpen] = useState(false);
  const count = filters.languages.length + filters.countries.length;
  const summary = [
    ...filters.languages.map((c) => labelOf(LANGUAGES, c)),
    ...filters.countries.map((c) => labelOf(COUNTRIES, c)),
  ].join(", ");

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-panel"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 5h18M6 12h12M10 19h4" />
        </svg>
        Talen en landen uitsluiten
        {count > 0 && <span className="rounded-full bg-accent px-2 text-xs font-semibold text-bg">{count}</span>}
        <motion.span aria-hidden animate={{ rotate: open ? 180 : 0 }}>
          ▾
        </motion.span>
      </button>

      {!open && count > 0 && <p className="text-center text-xs text-muted">Zonder: {summary}</p>}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="filter-panel"
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-5 rounded-2xl border border-muted/20 bg-surface/60 p-4 sm:p-5">
              <FilterGroup title="Talen" kind="languages" options={LANGUAGES} filters={filters} />
              <FilterGroup title="Landen" kind="countries" options={COUNTRIES} filters={filters} />
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Aangevinkte talen en landen komen niet meer in de filmrol.</span>
                {count > 0 && (
                  <button onClick={() => setFilters(NO_FILTERS)} className="underline underline-offset-2 hover:text-fg">
                    Alles wissen
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  title,
  kind,
  options,
  filters,
}: {
  title: string;
  kind: keyof ExclusionFilters;
  options: readonly { code: string; label: string }[];
  filters: ExclusionFilters;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const excluded = filters[kind].includes(o.code);
          return (
            <button
              key={o.code}
              type="button"
              role="checkbox"
              aria-checked={excluded}
              onClick={() => toggleFilter(kind, o.code)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                excluded
                  ? "border-accent-2 bg-accent-2/15 text-fg line-through decoration-accent-2"
                  : "border-muted/30 text-muted hover:border-accent hover:text-fg"
              }`}
            >
              {excluded && <span aria-hidden>✕ </span>}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
