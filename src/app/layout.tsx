import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME, SITE_URL } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const description =
  "CodeAssess is a developer assessment platform: companies build coding, MCQ and written tests, invite candidates to timed attempts, grade submissions and track pass rates.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${APP_NAME} — Developer Assessment Platform`, template: `%s · ${APP_NAME}` },
  description,
  applicationName: APP_NAME,
  keywords: ["developer assessment", "coding test", "technical hiring", "MCQ", "recruitment"],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Developer Assessment Platform`,
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: APP_NAME, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#14141f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
