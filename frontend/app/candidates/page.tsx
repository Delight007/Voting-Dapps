"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaFilter, FaSearch, FaTrophy, FaUsers } from "react-icons/fa";

import { ErrorToast } from "../components/toastify";
import { getVotingProgram } from "../lib/solana";

type Candidate = {
  id: number;
  name: string;
  address: string;
  about: string;
  message: string;
  totalVotes: number;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  avatar: string | null;
};

type CandidateAccount = {
  wallet?: { toBase58(): string };
  name?: string;
  about?: string;
  voteCount?: number | { toNumber(): number };
  status?: Record<string, unknown> | string;
  adminMessage?: string;
  avatarUrl?: string;
};

const STATUS_OPTIONS = ["All Status", "Approved", "Pending"];

function normalizeStatus(status: CandidateAccount["status"]) {
  if (!status || typeof status === "string") {
    return "pending";
  }

  const key = Object.keys(status)[0];

  if (key === "approved") return "approved";
  if (key === "rejected") return "rejected";
  return "pending";
}

function shortenAddress(address: string) {
  if (!address) return "Unknown";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function mapCandidate(account: CandidateAccount, index: number): Candidate {
  const status = normalizeStatus(account.status);

  return {
    id: index + 1,
    name: account.name || "Unnamed candidate",
    address: shortenAddress(account.wallet?.toBase58?.() ?? ""),
    about: account.about || "No bio provided.",
    message:
      account.adminMessage ||
      (status === "approved"
        ? "Approved by admin."
        : status === "rejected"
          ? "Rejected by admin."
          : "Awaiting admin approval."),
    totalVotes:
      typeof account.voteCount === "number"
        ? account.voteCount
        : account.voteCount && typeof account.voteCount.toNumber === "function"
          ? account.voteCount.toNumber()
          : 0,
    approved: status === "approved",
    status,
    avatar: account.avatarUrl || null,
  };
}

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCandidates() {
      try {
        setLoading(true);
        setError(null);

        const program = getVotingProgram();
        const allCandidates = await program.account.candidate.all();

        if (!isMounted) return;

        setCandidates(
          allCandidates.map(({ account }, index) =>
            mapCandidate(account as CandidateAccount, index),
          ),
        );
      } catch (loadError) {
        console.error("Failed to load candidates:", loadError);

        if (isMounted) {
          setError("Unable to load candidates from the Solana network.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadCandidates();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        const matchSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.address.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
          status === "All Status" || c.status === status.toLowerCase();
        return matchSearch && matchStatus;
      }),
    [candidates, search, status],
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-cyan-400 mb-1">
              All Candidates
            </h1>
            <p className="text-slate-500 text-base">
              Browse all registered candidates
            </p>
          </div>

          <div className="text-right">
            <p className="text-5xl font-extrabold text-slate-100">
              {loading ? "—" : candidates.length}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">Total Candidates</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-cyan-400/40 transition-colors">
            <FaSearch className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>

          <div className="relative flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 min-w-[150px]">
            <FaFilter className="text-slate-500 text-xs flex-shrink-0" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-200 outline-none cursor-pointer appearance-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o} className="bg-[#0d1117]">
                  {o}
                </option>
              ))}
            </select>
            <span className="text-slate-500 text-xs pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-slate-500">
            <FaUsers className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Loading candidates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-red-400">
            <ErrorToast message={error} />
            <FaUsers className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Candidates are unavailable.</p>
            <p className="text-sm mt-1">Reload the page to try again.</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CandidateCard key={`${c.id}-${c.address}`} candidate={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-500">
            <FaUsers className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No candidates found.</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const { id, name, address, about, message, totalVotes, approved, avatar } =
    candidate;

  return (
    <div className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-colors">
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3 relative">
          <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500/40 to-blue-600/40 flex items-center justify-center text-xl font-bold text-cyan-300">
                {name[0].toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <p className="font-bold text-slate-100 text-base leading-tight">
              {name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">ID: #{id}</p>
          </div>

          {approved && (
            <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
              <FaCheck className="text-[10px]" /> Approved
            </span>
          )}
        </div>

        <div>
          <span className="text-xs text-slate-500">Address: </span>
          <span className="text-xs text-cyan-400 font-medium">{address}</span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">About: </span>
          {about}
        </p>

        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-slate-300">Message: </span>
            <span className="text-cyan-400">{message}</span>
          </p>
        </div>

        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 mt-auto">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <FaTrophy className="text-cyan-400" />
            <span>Total Votes</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-100">
            {totalVotes}
          </span>
        </div>
      </div>
    </div>
  );
}
