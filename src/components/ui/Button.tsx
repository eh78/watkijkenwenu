import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-xl tracking-wider outline-none transition focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-accent text-bg shadow-[0_0_32px_var(--glow)] hover:brightness-110 active:scale-95"
      : "border border-muted/40 text-fg hover:border-accent";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}
