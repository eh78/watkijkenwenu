"use client";

import Image, { type ImageProps } from "next/image";
import { tmdbBackdropLoader, tmdbPosterLoader } from "@/lib/tmdb/images";

type Props = Omit<ImageProps, "src" | "loader"> & {
  /** TMDB-pad, bijv. "/abc123.jpg" */
  path: string;
  kind?: "poster" | "backdrop";
};

/** next/image met een loader die rechtstreeks het juiste TMDB-formaat ophaalt. */
export function TmdbImage({ path, kind = "poster", alt, ...rest }: Props) {
  return <Image src={path} alt={alt} loader={kind === "poster" ? tmdbPosterLoader : tmdbBackdropLoader} {...rest} />;
}
