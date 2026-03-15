import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppNav } from "@/components/app-nav";

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
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <AppNav />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
