"use client";

import { FaEnvelope, FaGithub, FaHeart, FaTwitter } from "react-icons/fa";

const quickLinks = ["Home", "Vote", "Candidates", "Results", "Profile"];
const resources = ["Documentation", "Whitepaper", "GitHub", "Support"];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] mt-16">
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand col */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white">
              <FaHeart className="text-sm" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              VoteChain
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            A decentralized voting platform built on Solana blockchain. Secure,
            transparent, and tamper-proof voting for the digital age.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">
              <FaGithub className="text-lg" />
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              <FaTwitter className="text-lg" />
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              <FaEnvelope className="text-lg" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-100 mb-1">
            Quick Links
          </span>
          {quickLinks.map((l) => (
            <a
              key={l}
              href="#"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-100 mb-1">
            Resources
          </span>
          {resources.map((l) => (
            <a
              key={l}
              href="#"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05] py-5 text-center text-xs text-slate-600">
        © 2025 VoteChain. All rights reserved. Powered by Solana.
      </div>
    </footer>
  );
}
