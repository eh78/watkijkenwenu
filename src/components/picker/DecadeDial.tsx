"use client";

import { motion } from "motion/react";
import { DECADES, type DecadeId } from "@/lib/constants";

interface Props {
  value: DecadeId;
  onChange: (id: DecadeId) => void;
}

/** Tijdlijn met decennia; de indicator glijdt mee naar de keuze. */
export function DecadeDial({ value, onChange }: Props) {
  const index = DECADES.findIndex((d) => d.id === value);

  function onKeyDown(e: React.KeyboardEvent) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = DECADES[(index + delta + DECADES.length) % DECADES.length];
    onChange(next.id);
  }

  return (
    <div role="radiogroup" aria-label="Decennium" onKeyDown={onKeyDown} className="relative flex w-full max-w-xl justify-between">
      <div aria-hidden className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-muted/30" />
      {DECADES.map((d) => {
        const active = d.id === value;
        return (
          <button
            key={d.id}
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(d.id)}
            className="relative z-10 grid size-14 place-items-center rounded-full font-display text-2xl tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent sm:size-16 sm:text-3xl"
          >
            {active && (
              <motion.span
                layoutId="decade-indicator"
                className="absolute inset-0 rounded-full bg-accent shadow-[0_0_32px_var(--glow)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative ${active ? "text-bg" : "text-muted hover:text-fg"}`}>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}
