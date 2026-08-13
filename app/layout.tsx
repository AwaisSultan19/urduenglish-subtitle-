import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subly",
  description: "Generate captions for Urdu videos with AI-powered transcription and translation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
