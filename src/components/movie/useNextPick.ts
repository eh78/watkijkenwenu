"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { nextFromPool } from "@/lib/pool";

/** Gaat naar de volgende ongeziene film uit de laatste spin, of terug naar de start. */
export function useNextPick(currentId: number) {
  const router = useRouter();
  return useCallback(() => {
    const next = nextFromPool(currentId);
    router.push(next ? `/film/${next.id}` : "/");
  }, [currentId, router]);
}
