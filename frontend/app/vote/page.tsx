"use client";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { FaCheck, FaPlay, FaTrophy } from "react-icons/fa";
import {
  ELECTION_ADDRESS,
  getVoterPda,
  getVotingProgram,
  getVotingProgramWithWallet,
} from "../lib/solana";

type CandidateAccount = {
  wallet: { toBase58(): string };
  name: string;
  about: string;
  voteCount: { toNumber(): number };
  status: Record<string, unknown>;
  adminMessage: string;
  avatarUrl: string;
};

function isApproved(status: unknown) {
  if (typeof status === "string") {
    return status.toLowerCase() === "approved";
  }

  return typeof status === "object" && status !== null && "approved" in status;
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function VotePage() {
  const [voted, setVoted] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isApprovedVoter, setIsApprovedVoter] = useState(false);
  const [isElectionOpen, setIsElectionOpen] = useState(false);
  const anchorWallet = useAnchorWallet();
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(candidate: Candidate) {
    if (!publicKey || !anchorWallet) {
      setVoteError("Connect your wallet before voting.");
      return;
    }

    if (!isElectionOpen) {
      setVoteError("Voting is not currently open.");
      return;
    }

    if (!isApprovedVoter) {
      setVoteError(
        "Your voter registration is not approved on-chain. Register this wallet and have an admin approve it before voting.",
      );
      return;
    }

    if (hasVoted) {
      setVoteError("This wallet has already voted.");
      return;
    }

    try {
      setVoteError(null);
      setSubmittingId(candidate.id);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.castVote()
        .accountsPartial({
          election: ELECTION_ADDRESS,
          candidate: new PublicKey(candidate.pda),
          voterWallet: publicKey,
        })
        .rpc();

      setVoted(candidate.id);
      setHasVoted(true);

      setCandidates((current) =>
        current.map((item) =>
          item.id === candidate.id
            ? { ...item, totalVotes: item.totalVotes + 1 }
            : item,
        ),
      );
    } catch (error) {
      console.error("Vote failed:", error);
      setVoteError("Vote failed. Check the election status and try again.");
    } finally {
      setSubmittingId(null);
    }
  }
  useEffect(() => {
    let cancelled = false;

    async function loadVoteData() {
      try {
        setLoading(true);

        const program = getVotingProgram();

        const [election, allCandidates] = await Promise.all([
          program.account.election.fetch(ELECTION_ADDRESS),
          program.account.candidate.all(),
        ]);

        const currentTime = Math.floor(Date.now() / 1000);

        const voter = publicKey
          ? await program.account.voter.fetchNullable(getVoterPda(publicKey))
          : null;

        if (cancelled) return;

        setIsElectionOpen(
          election.isActive &&
            currentTime >= election.startTime.toNumber() &&
            currentTime <= election.endTime.toNumber(),
        );

        const approvedCandidates = allCandidates
          .filter(({ account }) =>
            isApproved((account as CandidateAccount).status),
          )
          .map(({ publicKey: candidatePda, account }, index) => {
            const candidate = account as CandidateAccount;

            return {
              id: index + 1,
              pda: candidatePda.toBase58(),
              name: candidate.name,
              address: shortenAddress(candidate.wallet.toBase58()),
              about: candidate.about,
              message: candidate.adminMessage || "Approved by admin.",
              totalVotes: candidate.voteCount.toNumber(),
              approved: true,
              avatar: candidate.avatarUrl || null,
            };
          });

        setCandidates(approvedCandidates);
        setIsApprovedVoter(voter ? isApproved(voter.status) : false);
        setHasVoted(voter?.hasVoted ?? false);
      } catch (error) {
        console.error("Failed to load vote data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadVoteData();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-cyan-400 mb-1">
              Cast Your Vote
            </h1>
            <p className="text-slate-500 text-base">
              Select your preferred candidate
            </p>
          </div>

          {/* Active badge */}
          <div
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-bold text-sm ${
              isElectionOpen
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <FaPlay className="text-xs" />
            <span>{isElectionOpen ? "Active" : "Closed"}</span>
          </div>
        </div>

        {voteError && (
          <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {voteError}
          </p>
        )}

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              hasVoted={hasVoted}
              isVotedFor={voted === c.id}
              isSubmitting={submittingId === c.id}
              onVote={() => void handleVote(c)}
            />
          ))}
        </div>

        {/* Empty state */}
        {candidates.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            <FaTrophy className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No candidates available yet.</p>
            <p className="text-sm mt-1">
              Check back once the admin approves candidates.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Candidate Card ─────────────────────────────────────── */
type Candidate = {
  id: number;
  pda: string;
  name: string;
  address: string;
  about: string;
  message: string;
  totalVotes: number;
  approved: boolean;
  avatar: string | null;
};

function CandidateCard({
  candidate,
  hasVoted,
  isVotedFor,
  isSubmitting,
  onVote,
}: {
  candidate: Candidate;
  hasVoted: boolean;
  isVotedFor: boolean;
  isSubmitting: boolean;
  onVote: () => void;
}) {
  const { name, address, about, message, totalVotes, approved, avatar } =
    candidate;

  return (
    <div
      className={`flex flex-col bg-white/[0.03] border rounded-2xl overflow-hidden transition-colors
        ${isVotedFor ? "border-cyan-400/50" : "border-white/[0.08] hover:border-white/[0.14]"}`}
    >
      {/* Card body */}
      <div className="p-5 flex-1">
        {/* Avatar row */}
        <div className="flex items-center gap-3 mb-4 relative">
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
            <p className="text-xs text-slate-500 mt-0.5">ID: #{candidate.id}</p>
          </div>

          {/* Approved badge */}
          {approved && (
            <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
              <FaCheck className="text-[10px]" /> Approved
            </span>
          )}
        </div>

        {/* Address */}
        <div className="mb-3">
          <span className="text-xs text-slate-500">Address: </span>
          <span className="text-xs text-cyan-400 font-medium">{address}</span>
        </div>

        {/* About */}
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          <span className="text-slate-300 font-medium">About: </span>
          {about}
        </p>

        {/* Message box */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-slate-300">Message: </span>
            <span className="text-cyan-400">{message}</span>
          </p>
        </div>

        {/* Total Votes */}
        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <FaTrophy className="text-cyan-400" />
            <span>Total Votes</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-100">
            {totalVotes}
          </span>
        </div>
      </div>

      {/* Vote button */}
      <div className="px-5 pb-5">
        <button
          onClick={onVote}
          disabled={hasVoted || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
            ${
              isVotedFor
                ? "bg-green-500/20 border border-green-500/40 text-green-400 cursor-default"
                : hasVoted
                  ? "bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90 cursor-pointer"
            }`}
        >
          <FaCheck />
          {isSubmitting
            ? "Submitting vote..."
            : isVotedFor
              ? `Voted for ${name}`
              : hasVoted
                ? "You have already voted"
                : `Vote for ${name}`}
        </button>
      </div>
    </div>
  );
}
