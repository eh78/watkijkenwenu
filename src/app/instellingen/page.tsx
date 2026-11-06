import type { Metadata } from "next";
import Link from "next/link";
import { RadarrSettingsForm } from "@/components/settings/RadarrSettingsForm";

export const metadata: Metadata = { title: "Instellingen", robots: { index: false } };

export default function SettingsPage() {
  return (
    <main className="theme-surface flex flex-1 flex-col">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-muted/30 px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
        >
          <span aria-hidden>←</span> Startscherm
        </Link>
      </nav>
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="font-display text-5xl tracking-wide">Instellingen</h1>
        <RadarrSettingsForm />
      </div>
    </main>
  );
}
