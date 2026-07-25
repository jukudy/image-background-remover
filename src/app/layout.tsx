import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Free Image Background Remover – Remove Background Online", template: "%s | Clearcut" },
  description: "Remove image backgrounds automatically in seconds. Download a transparent PNG with no signup and no watermark.",
  alternates: { canonical: "/" },
  openGraph: { title: "Free Image Background Remover", description: "Remove backgrounds online and download a transparent PNG.", url: "/", siteName: "Clearcut", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Clearcut image background remover" }] },
  twitter: { card: "summary_large_image", title: "Free Image Background Remover", description: "Remove backgrounds online and download a transparent PNG.", images: ["/opengraph-image"] },
};

export const viewport: Viewport = { themeColor: "#f8faf7", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-full font-sans antialiased">{children}</body></html>;
}
