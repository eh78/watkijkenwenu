import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieHero, MovieHeroSkeleton } from "@/components/movie/MovieHero";
import { getMovieDetails } from "@/lib/tmdb/movies";
import { posterUrl } from "@/lib/tmdb/images";

const parseId = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : null);

export async function generateMetadata({ params }: PageProps<"/film/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const movie = id ? await getMovieDetails(id) : null;
  if (!movie) return { title: "Film niet gevonden" };

  const title = movie.year ? `${movie.title} (${movie.year})` : movie.title;
  return {
    title,
    description: movie.overview.slice(0, 160),
    openGraph: {
      title,
      description: movie.overview.slice(0, 200),
      images: movie.posterPath ? [{ url: posterUrl(movie.posterPath, "w780"), width: 780, height: 1170 }] : [],
    },
  };
}

async function MovieContent({ params }: Pick<PageProps<"/film/[id]">, "params">) {
  const id = parseId((await params).id);
  const movie = id ? await getMovieDetails(id) : null;
  if (!movie) notFound();
  return <MovieHero movie={movie} />;
}

export default function FilmPage({ params }: PageProps<"/film/[id]">) {
  return (
    <Suspense fallback={<MovieHeroSkeleton />}>
      <MovieContent params={params} />
    </Suspense>
  );
}
