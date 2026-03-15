import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppNav } from "@/components/app-nav";
import { MotionProvider } from "@/components/motion-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Delivery Accelerator",
  description: "Compliant-by-construction web generation workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}>
      <body className="antialiased font-body bg-[#000014] text-white">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <Providers>
          <MotionProvider>
            <div className="flex min-h-screen flex-col">
              <AppNav />
              <div className="flex flex-1 flex-col">{children}</div>
            </div>
          </MotionProvider>
        </Providers>
      </body>
    </html>
  );
}
