"use client";

import Image, { type ImageProps } from "next/image";
import { tmdbBackdropLoader, tmdbLogoLoader, tmdbPosterLoader, tmdbProfileLoader } from "@/lib/tmdb/images";

const LOADERS = {
  poster: tmdbPosterLoader,
  backdrop: tmdbBackdropLoader,
  profile: tmdbProfileLoader,
  logo: tmdbLogoLoader,
};

type Props = Omit<ImageProps, "src" | "loader"> & {
  /** TMDB-pad, bijv. "/abc123.jpg" */
  path: string;
  kind?: keyof typeof LOADERS;
};

/** next/image met een loader die rechtstreeks het juiste TMDB-formaat ophaalt. */
export function TmdbImage({ path, kind = "poster", alt, ...rest }: Props) {
  return <Image src={path} alt={alt} loader={LOADERS[kind]} {...rest} />;
}
