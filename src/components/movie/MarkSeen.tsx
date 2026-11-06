"use client";

import { useEffect } from "react";
import { markSeen } from "@/lib/seen";

/** Registreert de getoonde film als gezien (ook bij direct openen van een link). */
export function MarkSeen({ id }: { id: number }) {
  useEffect(() => markSeen(id), [id]);
  return null;
}
