import Link from "next/link";

export default function NotFound() {
  return (
    <main className="theme-surface flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-6xl">Deze film is uit de roulatie</h1>
      <p className="text-muted">We konden deze film niet vinden.</p>
      <Link href="/" className="rounded-full bg-accent px-6 py-3 font-display text-xl text-bg">
        Terug naar de filmrol
      </Link>
    </main>
  );
}
