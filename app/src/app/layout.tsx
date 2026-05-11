import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletContextProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Lumina — Decentralised AI Model Marketplace on Solana",
  description:
    "Discover, deploy, and earn from AI models. Pay with $LUMINA tokens. Settled on Solana in ~400 ms.",
  openGraph: {
    title: "Lumina AI Marketplace",
    description: "Decentralised AI inference on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <WalletContextProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
        </WalletContextProvider>
      </body>
    </html>
  );
}
