import type { Metadata } from "next";
import { Archivo_Black, Fraunces, Inter } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Dana Badawy | Content Strategy & Creation",
  description:
    "Content, brand strategy, social media marketing, for food and lifestyle brands, from the raw idea to execution.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dana Badawy",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        {children}
      </body>
    </html>
  );
}
