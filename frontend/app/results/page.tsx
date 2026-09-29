"use client";

import { useEffect, useState } from "react";
import { FaChartLine, FaSync, FaTrophy } from "react-icons/fa";

import { ErrorToast } from "../components/toastify";
import { ELECTION_ADDRESS, getVotingProgram } from "../lib/solana";

type Candidate = {
  id: number;
  name: string;
  address: string;
  about: string;
  message: string;
  totalVotes: number;
  approved: boolean;
  avatar: string | null;
};

type CandidateAccount = {
  wallet: { toBase58(): string };
  name: string;
  about: string;
  voteCount: { toNumber(): number };
  status: Record<string, unknown>;
  adminMessage: string;
  avatarUrl: string;
};

function isApproved(status: Record<string, unknown>) {
  return "approved" in status;
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function ResultsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadResults() {
    try {
      setRefreshing(true);
      setError(null);

      const program = getVotingProgram();

      const [election, candidateAccounts] = await Promise.all([
        program.account.election.fetch(ELECTION_ADDRESS),
        program.account.candidate.all(),
      ]);

      const approvedCandidates = candidateAccounts
        .map(({ account }, index) => {
          const candidate = account as CandidateAccount;

          return {
            id: index + 1,
            name: candidate.name,
            address: shortenAddress(candidate.wallet.toBase58()),
            about: candidate.about,
            message: candidate.adminMessage || "Approved by admin.",
            totalVotes: candidate.voteCount.toNumber(),
            approved: isApproved(candidate.status),
            avatar: candidate.avatarUrl || null,
          };
        })
        .filter((candidate) => candidate.approved)
        .sort((first, second) => second.totalVotes - first.totalVotes);

      setCandidates(approvedCandidates);
      setTotalVoters(election.totalVoters.toNumber());
    } catch (loadError) {
      console.error("Failed to load voting results:", loadError);
      setError("Unable to load voting results from devnet.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadResults();
  }, []);

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.totalVotes,
    0,
  );

  const voterTurnout =
    totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : "0.00";

  const stats = [
    {
      icon: <FaTrophy className="text-3xl text-cyan-400" />,
      value: totalVotes,
      label: "Total Votes",
    },
    {
      icon: <FaChartLine className="text-3xl text-cyan-400" />,
      value: `${voterTurnout}%`,
      label: "Voter Turnout",
    },
    {
      icon: <FaTrophy className="text-3xl text-green-400" />,
      value: totalVotes,
      label: "Votes Cast",
    },
    {
      icon: <FaTrophy className="text-3xl text-purple-400" />,
      value: candidates.length,
      label: "Approved Candidates",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col">
      <main className="max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-cyan-400 mb-1">
              Voting Results
            </h1>
            <p className="text-slate-500 text-base">
              Live results and statistics from Solana devnet
            </p>
          </div>

          <button
            onClick={() => void loadResults()}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-400/20 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && <ErrorToast message={error} />}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-7 px-4 text-center gap-2"
            >
              {stat.icon}
              <span className="text-4xl font-extrabold text-slate-100">
                {refreshing ? "—" : stat.value}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-5">
          Approved Candidates
        </h2>

        {refreshing ? (
          <div className="py-16 text-center text-slate-500">
            Loading live results...
          </div>
        ) : candidates.length > 0 ? (
          <div className="flex flex-col gap-4">
            {candidates.map((candidate, index) => (
              <ResultCandidateRow
                key={`${candidate.id}-${candidate.address}`}
                candidate={candidate}
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] py-16 text-center text-slate-500">
            No approved candidates yet.
          </div>
        )}
      </main>
    </div>
  );
}

function ResultCandidateRow({
  candidate,
  rank,
}: {
  candidate: Candidate;
  rank: number;
}) {
  return (
    <article className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-white/[0.14]">
      <span className="w-10 shrink-0 text-center text-2xl font-extrabold text-cyan-400">
        #{rank}
      </span>

      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-700">
        {candidate.avatar ? (
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/40 to-blue-600/40 text-xl font-bold text-cyan-300">
            {candidate.name[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-bold text-slate-100">
          {candidate.name}
        </h3>
        <p className="text-xs text-cyan-400">{candidate.address}</p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {candidate.about}
        </p>
        {candidate.message && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {candidate.message}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 text-right">
        <FaTrophy className="text-cyan-400" />
        <span className="text-2xl font-extrabold text-slate-100">
          {candidate.totalVotes}
        </span>
        <span className="hidden text-sm text-slate-500 sm:inline">votes</span>
      </div>
    </article>
  );
}
