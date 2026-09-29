"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaPlay,
  FaUsers,
} from "react-icons/fa";

import {
  ELECTION_ADDRESS,
  getCandidatePda,
  getVoterPda,
  getVotingProgram,
} from "../lib/solana";
import { ErrorToast } from "./toastify";

type RegistrationLookup = {
  walletAddress: string;
  status: "registered" | "unregistered" | "error";
};

type ElectionSummary = {
  title: string;
  isActive: boolean;
  startTime: number;
  endTime: number;
  totalCandidates: string;
  totalVoters: string;
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));
}

export default function HeroSection() {
  const { publicKey } = useWallet();
  const [election, setElection] = useState<ElectionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registrationLookup, setRegistrationLookup] =
    useState<RegistrationLookup | null>(null);

  useEffect(() => {
    const connectedPublicKey = publicKey;
    if (!connectedPublicKey) return;

    let cancelled = false;

    async function checkRegistration(wallet: PublicKey) {
      const walletAddress = wallet.toBase58();

      try {
        const program = getVotingProgram();
        const [voter, candidate] = await Promise.all([
          program.account.voter.fetchNullable(getVoterPda(wallet)),
          program.account.candidate.fetchNullable(getCandidatePda(wallet)),
        ]);

        if (cancelled) return;

        setRegistrationLookup({
          walletAddress,
          status: voter || candidate ? "registered" : "unregistered",
        });
      } catch (lookupError) {
        console.error("Failed to check wallet registration:", lookupError);

        if (!cancelled) {
          setRegistrationLookup({ walletAddress, status: "error" });
        }
      }
    }

    void checkRegistration(connectedPublicKey);

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  useEffect(() => {
    async function loadElection() {
      try {
        const account =
          await getVotingProgram().account.election.fetch(ELECTION_ADDRESS);

        setElection({
          title: account.title,
          isActive: account.isActive,
          startTime: account.startTime.toNumber(),
          endTime: account.endTime.toNumber(),
          totalCandidates: account.totalCandidates.toString(),
          totalVoters: account.totalVoters.toString(),
        });
      } catch (loadError) {
        console.error("Failed to load election:", loadError);
        setError("Unable to load election from localnet.");
      }
    }

    void loadElection();
  }, []);

  const statusLabel = error
    ? "Unavailable"
    : election
      ? election.isActive
        ? "Active"
        : "Closed"
      : "Loading";

  const walletAddress = publicKey?.toBase58();
  const currentRegistration =
    registrationLookup && registrationLookup.walletAddress === walletAddress
      ? registrationLookup.status
      : publicKey
        ? "checking"
        : "disconnected";

  const stats = [
    {
      icon: <FaUsers className="text-2xl" />,
      label: "Total Voters",
      value: election?.totalVoters ?? "—",
      color: "text-cyan-400",
    },
    {
      icon: <FaUsers className="text-2xl" />,
      label: "Candidates",
      value: election?.totalCandidates ?? "—",
      color: "text-cyan-400",
    },
    {
      icon: <FaCheckCircle className="text-2xl" />,
      label: "Election",
      value: election ? "Loaded" : "—",
      color: "text-green-400",
    },
    {
      icon: <FaBolt className="text-2xl" />,
      label: "Status",
      value: statusLabel,
      color: "text-purple-400",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
      <h1 className="leading-tight mb-5">
        <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Solana Blockchain
        </span>
        <br />
        <span className="text-5xl md:text-6xl font-extrabold text-slate-100">
          Decentralized Voting
        </span>
      </h1>

      <p className="text-slate-400 text-lg leading-relaxed mb-9">
        Secure, transparent, and tamper-proof voting powered by Solana
        blockchain technology.
        <br />
        Your voice matters, your vote is protected.
      </p>

      <div className="flex justify-center gap-4 flex-wrap mb-12">
        {currentRegistration === "registered" ? (
          <>
            <Link
              href="/vote"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              Cast Your Vote <FaArrowRight />
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-cyan-400/35 px-7 py-3.5 text-base font-bold text-cyan-400 transition-colors hover:bg-cyan-400/5"
            >
              View Profile
            </Link>
          </>
        ) : currentRegistration === "unregistered" ||
          currentRegistration === "disconnected" ? (
          <>
            <Link
              href="/profile?register=voter"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              Register as voter <FaArrowRight />
            </Link>
            <Link
              href="/profile?register=candidate"
              className="rounded-xl border border-cyan-400/35 px-7 py-3.5 text-base font-bold text-cyan-400 transition-colors hover:bg-cyan-400/5"
            >
              Register as candidate
            </Link>
          </>
        ) : (
          <p className="py-3.5 text-sm text-slate-400" role="status">
            {currentRegistration === "checking"
              ? "Checking wallet registration..."
              : "Unable to verify wallet registration."}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-2xl px-7 py-5 mb-8 text-left flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-bold text-slate-100">
            {election?.title ?? "Loading election..."}
          </span>

          <div className="text-sm text-slate-500">
            Start:&nbsp;
            <span className="text-orange-400 font-semibold">
              {election ? formatDate(election.startTime) : "—"}
            </span>
            &nbsp;&nbsp;End:&nbsp;
            <span className="text-orange-400 font-semibold">
              {election ? formatDate(election.endTime) : "—"}
            </span>
          </div>

          {error && <ErrorToast message={error} />}
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm">
          <FaPlay className="text-xs" />
          <span>{statusLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 bg-white/[0.04] border border-white/[0.07] rounded-2xl py-5 px-3 sm:py-6 sm:px-4 flex flex-col items-center gap-2"
          >
            <span className={stat.color}>{stat.icon}</span>
            <span className="max-w-full break-words text-center text-2xl font-extrabold leading-tight text-slate-100 sm:text-3xl">
              {stat.value}
            </span>
            <span className="text-center text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
