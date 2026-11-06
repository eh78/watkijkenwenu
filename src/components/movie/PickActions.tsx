"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { requestRespin } from "@/lib/pool";
import { useNextPick } from "./useNextPick";

export function PickActions({ currentId }: { currentId: number }) {
  const goNext = useNextPick(currentId);
  return (
    <div className="flex flex-wrap justify-center gap-3 md:justify-start">
      <Button onClick={goNext}>Andere film →</Button>
      <Link
        href="/"
        onClick={requestRespin}
        className="inline-flex items-center rounded-full border border-muted/40 px-6 py-3 font-display text-xl tracking-wider hover:border-accent"
      >
        Opnieuw draaien
      </Link>
    </div>
  );
}
