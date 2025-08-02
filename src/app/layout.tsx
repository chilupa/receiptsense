import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ReceiptSense - AI-Powered Receipt Analysis",
  description: "Smart grocery receipt analyzer using Redis vector search. Upload receipts, get instant OCR processing, and discover price insights across stores.",
  keywords: "receipt analysis, price comparison, OCR, Redis, AI, grocery shopping, price insights",
  authors: [{ name: "ReceiptSense" }],
  openGraph: {
    title: "ReceiptSense - AI-Powered Receipt Analysis",
    description: "Smart grocery receipt analyzer using Redis vector search for real-time price insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
