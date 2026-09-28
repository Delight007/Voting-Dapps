"use client";

import { FaArrowRight } from "react-icons/fa";

export default function CTABanner() {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-20">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-10 py-14 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Ready to Make Your Voice Heard?
        </h2>
        <p className="text-white/85 text-base leading-relaxed mb-8">
          Join thousands of voters using blockchain technology for secure and
          transparent voting.
        </p>
        <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-gray-900 font-bold text-base hover:bg-white/90 transition-colors">
          Start Voting <FaArrowRight />
        </button>
      </div>
    </section>
  );
}
