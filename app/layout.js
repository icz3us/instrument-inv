import "./globals.css";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define default metadata
export const metadata = {
  title: {
    default: "Instrument Inventory - Manage Musical Instruments",
    template: "%s | Instrument Inventory"
  },
  description: "Role-based instrument inventory management system for schools and music institutions",
  keywords: ["instrument", "inventory", "music", "school", "management"],
  authors: [{ name: "Instrument Inventory Team" }],
  creator: "Instrument Inventory Team",
  publisher: "Instrument Inventory",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "Instrument Inventory - Manage Musical Instruments",
    description: "Role-based instrument inventory management system for schools and music institutions",
    siteName: "Instrument Inventory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instrument Inventory - Manage Musical Instruments",
    description: "Role-based instrument inventory management system for schools and music institutions",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}