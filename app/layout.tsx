import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ReactLenis from "lenis/react";
import { Toaster } from "@/components/ui/sonner";

const amiga = localFont({
  src: "../assets/fonts/amiga4ever.woff2",
  variable: "--font-amiga",
  display: "swap",
  preload: true,
});

const dystopian = localFont({
  src: "../assets/fonts/Sddystopian.otf",
  variable: "--font-dystopian",
  preload: true,
});

const orbitron = localFont({
  src: "../assets/fonts/Orbitron-VariableFont.ttf",
  variable: "--font-orbitron",
  preload: true,
});

const delagothic = localFont({
  src: "../assets/fonts/DelaGothicOne-Regular.ttf",
  variable: "--font-delagothic",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "DevHost 2025",
    template: `%s - DevHost 2025`,
  },
  description: "Connecting Minds, Crafting Progress.",
  keywords: [
    "sosc",
    "Sahyadri Open Source Community",
    "sosc devhost",
    "devhost 2025",
    "DevHost",
    "Devhost",
    "Devhost 2025",
    "DevHost 2025",
  ],
  creator: "so-sc",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devhost.sosc.org.in/",
    title: "DevHost 2025",
    description: "Connecting Minds, Crafting Progress.",
    siteName: "DevHost 2025",
    images: [
      {
        url: "https://devhost.sosc.org.in/og.png",
        width: 1200,
        height: 630,
        alt: "DevHost 2025",
      },
    ],
  },
  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon-16x16.png",
    apple: "/favicons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${amiga.variable} ${dystopian.variable} ${delagothic.variable} ${orbitron.variable} antialiased`}
      >
        <ReactLenis root />
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
