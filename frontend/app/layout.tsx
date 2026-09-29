import "@solana/wallet-adapter-react-ui/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import SolanaProvider from "./components/solana-provider";
import { ToastViewport } from "./components/toastify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VoteChain | Decentralized Voting on Solana",
    template: "%s | VoteChain",
  },
  applicationName: "VoteChain",
  description:
    "VoteChain brings transparent, verifiable elections on-chain with Solana.",
  keywords: ["VoteChain", "Solana", "on-chain voting", "elections"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "VoteChain | Decentralized Voting on Solana",
    description:
      "VoteChain brings transparent, verifiable elections on-chain with Solana.",
    siteName: "VoteChain",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VoteChain | Decentralized Voting on Solana",
    description:
      "VoteChain brings transparent, verifiable elections on-chain with Solana.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="app-motion min-h-full flex flex-col">
        <SolanaProvider>
          <ToastViewport />
          <Navbar />
          {children}
          <Footer />
        </SolanaProvider>
      </body>
    </html>
  );
}
