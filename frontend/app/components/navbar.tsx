"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import {
  FaChartBar,
  FaCog,
  FaHome,
  FaUser,
  FaUsers,
  FaVoteYea,
} from "react-icons/fa";
import { RiBarChartFill } from "react-icons/ri";

const navLinks = [
  { label: "Home", icon: <FaHome />, link: "/", active: true },
  { label: "Vote", icon: <FaVoteYea />, link: "/vote" },
  { label: "Candidates", icon: <FaUsers />, link: "/candidates" },
  { label: "Results", icon: <FaChartBar />, link: "/results" },
  { label: "Profile", icon: <FaUser />, link: "/profile" },
  { label: "Admin", icon: <FaCog />, link: "/admin" },
];

export default function Navbar() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleWalletClick = () => {
    console.log("Wallet clicked");
    if (connected) {
      void disconnect();
      return;
    }

    setVisible(true);
  };

  const walletLabel = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "Connect Wallet";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 bg-[#0d1117]/85 backdrop-blur-md border-b border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
          <RiBarChartFill />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          VoteChain
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link key={link.label} href={link.link} passHref>
            <button
              //   key={link.label}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  link.active
                    ? "bg-cyan-400/10 text-slate-100 border border-cyan-400/20"
                    : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          </Link>
        ))}
      </div>

      {/* Wallet */}
      <button
        onClick={handleWalletClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold text-sm cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-white/20" />
        <span>{walletLabel}</span>
      </button>
    </nav>
  );
}
