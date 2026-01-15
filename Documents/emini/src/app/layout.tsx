import type { Metadata } from "next";
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

// Hedvig Letters Sans for body text
const hedvigSans = Hedvig_Letters_Sans({
  variable: "--font-hedvig-sans",
  subsets: ["latin"],
  weight: "400",
});

// Hedvig Letters Serif for headings
const hedvigSerif = Hedvig_Letters_Serif({
  variable: "--font-hedvig-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emini | Invoicing & Finance for South Africa",
  description: "Emini helps you manage your invoicing and finances with ease.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${hedvigSans.variable} ${hedvigSerif.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
