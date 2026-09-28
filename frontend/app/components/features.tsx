"use client";

import { FaBolt, FaChartLine, FaShieldAlt, FaUsers } from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt className="text-2xl text-white" />,
    title: "Secure & Transparent",
    desc: "Built on Solana blockchain ensuring every vote is secure, transparent, and immutable.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: <FaBolt className="text-2xl text-white" />,
    title: "Lightning Fast",
    desc: "Experience instant transactions with Solana's high-speed blockchain infrastructure.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <FaUsers className="text-2xl text-white" />,
    title: "Democratic Process",
    desc: "Fair and transparent voting system with complete voter verification and approval.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: <FaChartLine className="text-2xl text-white" />,
    title: "Real-time Results",
    desc: "Track voting progress and results in real-time with complete transparency.",
    gradient: "from-orange-500 to-red-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-3">
        Why Choose{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          VoteChain
        </span>
      </h2>
      <p className="text-slate-500 text-base mb-12">
        Experience the next generation of democratic voting
      </p>

      <div className="grid grid-cols-2 gap-5 text-left">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:border-white/10 transition-colors"
          >
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5`}
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2.5">
              {f.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
