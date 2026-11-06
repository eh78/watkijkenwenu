"use client";

import { motion } from "motion/react";
import { TmdbImage } from "@/components/ui/TmdbImage";
import type { MovieSummary } from "@/lib/tmdb/types";

interface Props {
  movie: MovieSummary;
  width: number;
  highlighted?: boolean;
  dimmed?: boolean;
}

export function PosterCard({ movie, width, highlighted, dimmed }: Props) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-md bg-surface"
      style={{ width, aspectRatio: "2 / 3" }}
      animate={{
        scale: highlighted ? 1.1 : 1,
        opacity: dimmed ? 0.3 : 1,
        boxShadow: highlighted ? "0 0 60px var(--glow)" : "0 0 0px transparent",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {movie.posterPath && (
        <TmdbImage
          path={movie.posterPath}
          alt={movie.title}
          fill
          sizes={`${width}px`}
          loading="eager"
          draggable={false}
          className="object-cover"
        />
      )}
    </motion.div>
  );
}
