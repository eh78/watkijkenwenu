import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Bebas_Neue({ variable: "--font-display", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Wat kijken we nu?", template: "%s · Wat kijken we nu?" },
  description: "Kies een decennium en een genre, laat de filmrol draaien en ontdek wat je vanavond kijkt.",
};

export const viewport: Viewport = { themeColor: "#0b0b0f" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
