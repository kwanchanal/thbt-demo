import type { Metadata } from "next";
import { withBase } from "@/lib/withBase";
import "./globals.css";

export const metadata: Metadata = {
  title: "THBT — Thai baht, upgraded (Demo)",
  description: "Internal demo of the THBT branding landing page.",
  // Demo only: keep out of search until legal sign-off.
  robots: { index: false, follow: false },
  icons: { icon: withBase("/coin.svg") },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
