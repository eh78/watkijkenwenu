"use client";

import { motion } from "motion/react";
import { GENRES, type GenreId } from "@/lib/constants";

interface Props {
  value: GenreId | null;
  onChange: (id: GenreId) => void;
}

export function GenreSelector({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Genre" className="flex max-w-2xl flex-wrap justify-center gap-2">
      {GENRES.map((g) => {
        const active = g.id === value;
        return (
          <motion.button
            key={g.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(g.id)}
            whileTap={{ scale: 0.94 }}
            animate={{ scale: active ? 1.06 : 1 }}
            className={`rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              active
                ? "border-accent bg-accent text-bg shadow-[0_0_24px_var(--glow)]"
                : "border-muted/30 text-muted hover:border-accent hover:text-fg"
            }`}
          >
            {g.label}
          </motion.button>
        );
      })}
    </div>
  );
}
