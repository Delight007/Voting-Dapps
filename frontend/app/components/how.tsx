"use client";

import {
  FaChartBar,
  FaFileAlt,
  FaUsers,
  FaVoteYea,
  FaWallet,
} from "react-icons/fa";

const steps = [
  {
    num: "01",
    icon: <FaWallet />,
    title: "Connect Your Wallet",
    desc: "Connect your Solana wallet (Phantom, Solflare, etc.) to get started with VoteChain.",
  },
  {
    num: "02",
    icon: <FaFileAlt />,
    title: "Register as Voter",
    desc: "Complete your voter registration with your details and wait for admin approval.",
  },
  {
    num: "03",
    icon: <FaUsers />,
    title: "Browse Candidates",
    desc: "Explore approved candidates, view their profiles and campaign information.",
  },
  {
    num: "04",
    icon: <FaVoteYea />,
    title: "Cast Your Vote",
    desc: "Vote for your preferred candidate during the active voting period. One vote per voter.",
  },
  {
    num: "05",
    icon: <FaChartBar />,
    title: "View Results",
    desc: "Monitor real-time voting results and see the outcome transparently on the blockchain.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-3">
        How It{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Works
        </span>
      </h2>
      <p className="text-slate-500 text-base mb-12">
        Simple steps to participate in democratic voting
      </p>

      <div className="flex flex-col gap-4 text-left">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-7 py-5 hover:border-white/10 transition-colors"
          >
            <span className="text-3xl font-black text-cyan-400 min-w-[48px] leading-none pt-0.5">
              {s.num}
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1.5">
                {s.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
