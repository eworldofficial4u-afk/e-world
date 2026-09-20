import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import DevToolsGuard from "./components/DevToolsGuard";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "E-WORLD // TECHNICAL HUD",
  description: "E-World Cinematic WebGL & Live Telemetry Experience",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    noarchive: true,
    noimageindex: true,
  },
  other: {
    "robots": "noai, noimageai, noarchive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${orbitron.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-black text-white selection:bg-white selection:text-black">
        <DevToolsGuard />
        {children}
      </body>
    </html>
  );
}
