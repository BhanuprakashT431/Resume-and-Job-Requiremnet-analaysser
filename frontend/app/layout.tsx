import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#080812",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "AI-Adaptive Onboarding Engine",
  description:
    "Upload your resume and job description to instantly visualize your skill gap and generate a personalized AI-powered learning roadmap.",
  keywords: ["skill gap", "ai onboarding", "learning roadmap", "adaptive learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
