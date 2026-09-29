"use client";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { useCallback, useEffect, useState } from "react";
import {
  FaCheck,
  FaClock,
  FaCog,
  FaExclamationCircle,
  FaSync,
  FaTimes,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import { ErrorToast } from "../components/toastify";
import {
  ELECTION_ADDRESS,
  getVotingProgram,
  getVotingProgramWithWallet,
} from "../lib/solana";

/* ─── Types ──────────────────────────────────────────────── */
type Status = "approved" | "pending" | "rejected";

type Voter = {
  id: number;
  pda: string;
  name: string;
  address: string;
  voted: boolean;
  bio: string;
  message: string;
  status: Status;
  avatar: string | null;
};

type Candidate = {
  id: number;
  pda: string;
  name: string;
  address: string;
  about: string;
  message: string;
  totalVotes: number;
  status: Status;
  avatar: string | null;
};

type ElectionInfo = {
  admin: string;
  isActive: boolean;
  startTime: number;
  endTime: number;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

function toDateTimeLocalInput(timestamp: number) {
  const date = new Date(timestamp * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

/* ─── Page ───────────────────────────────────────────────── */
export default function AdminPage() {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingPda, setProcessingPda] = useState<string | null>(null);

  const [voters, setVoters] = useState<Voter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<"voters" | "candidates">("voters");
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [electionInfo, setElectionInfo] = useState<ElectionInfo | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [isUpdatingPeriod, setIsUpdatingPeriod] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isTransferringAdmin, setIsTransferringAdmin] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [isClosingElection, setIsClosingElection] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      setIsCheckingAdmin(true);
      setLoadError(null);

      const program = getVotingProgram();

      const election = await program.account.election.fetch(ELECTION_ADDRESS);
      setElectionInfo({
        admin: election.admin.toBase58(),
        isActive: election.isActive,
        startTime: election.startTime.toNumber(),
        endTime: election.endTime.toNumber(),
      });

      const walletIsAdmin = Boolean(
        publicKey && election.admin.equals(publicKey),
      );

      setIsAdmin(walletIsAdmin);

      if (!walletIsAdmin) {
        setVoters([]);
        setCandidates([]);
        return;
      }

      const [voterAccounts, candidateAccounts] = await Promise.all([
        program.account.voter.all(),
        program.account.candidate.all(),
      ]);

      const getStatus = (status: Record<string, unknown>): Status => {
        if ("approved" in status) return "approved";
        if ("rejected" in status) return "rejected";
        return "pending";
      };

      const loadedVoters: Voter[] = voterAccounts.map(
        ({ publicKey: voterPda, account }, index) => {
          const voter = account as {
            wallet: { toBase58(): string };
            name: string;
            bio: string;
            hasVoted: boolean;
            status: Record<string, unknown>;
            adminMessage: string;
            avatarUrl: string;
          };

          const status = getStatus(voter.status);

          return {
            id: index + 1,
            pda: voterPda.toBase58(),
            name: voter.name,
            address: `${voter.wallet.toBase58().slice(0, 4)}...${voter.wallet
              .toBase58()
              .slice(-4)}`,
            voted: voter.hasVoted,
            bio: voter.bio,
            message:
              voter.adminMessage ||
              (status === "pending"
                ? "Awaiting admin approval."
                : "No admin message."),
            status,
            avatar: voter.avatarUrl || null,
          };
        },
      );

      const loadedCandidates: Candidate[] = candidateAccounts.map(
        ({ publicKey: candidatePda, account }, index) => {
          const candidate = account as {
            wallet: { toBase58(): string };
            name: string;
            about: string;
            voteCount: { toNumber(): number };
            status: Record<string, unknown>;
            adminMessage: string;
            avatarUrl: string;
          };

          const status = getStatus(candidate.status);

          return {
            id: index + 1,
            pda: candidatePda.toBase58(),
            name: candidate.name,
            address: `${candidate.wallet
              .toBase58()
              .slice(0, 4)}...${candidate.wallet.toBase58().slice(-4)}`,
            about: candidate.about,
            message:
              candidate.adminMessage ||
              (status === "pending"
                ? "Awaiting admin approval."
                : "No admin message."),
            totalVotes: candidate.voteCount.toNumber(),
            status,
            avatar: candidate.avatarUrl || null,
          };
        },
      );

      setVoters(loadedVoters);
      setCandidates(loadedCandidates);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      setIsAdmin(false);
      setVoters([]);
      setCandidates([]);
      setElectionInfo(null);
      setLoadError("Unable to load dashboard data from devnet.");
    } finally {
      setRefreshing(false);
      setIsCheckingAdmin(false);
    }
  }, [publicKey]);

  useEffect(() => {
    void Promise.resolve().then(loadDashboard);
  }, [loadDashboard]);

  const pendingVoters = voters.filter((v) => v.status === "pending");
  const pendingCandidates = candidates.filter((c) => c.status === "pending");
  const approvedVoters = voters.filter((v) => v.status === "approved").length;
  const approvedCandidates = candidates.filter(
    (c) => c.status === "approved",
  ).length;

  const stats = [
    {
      icon: <FaUsers className="text-3xl text-cyan-400" />,
      value: voters.length,
      label: "Total Voters",
      sub: pendingVoters.length > 0 ? `${pendingVoters.length} pending` : null,
    },
    {
      icon: <FaUsers className="text-3xl text-cyan-400" />,
      value: candidates.length,
      label: "Total Candidates",
      sub:
        pendingCandidates.length > 0
          ? `${pendingCandidates.length} pending`
          : null,
    },
    {
      icon: <FaUserCheck className="text-3xl text-green-400" />,
      value: approvedVoters,
      label: "Approved Voters",
      sub: null,
    },
    {
      icon: <FaUserCheck className="text-3xl text-purple-400" />,
      value: approvedCandidates,
      label: "Approved Candidates",
      sub: null,
    },
  ];

  const handleRefresh = () => {
    void loadDashboard();
  };

  function openPeriodModal() {
    if (!electionInfo) return;

    setPeriodError(null);
    setPeriodStart(toDateTimeLocalInput(electionInfo.startTime));
    setPeriodEnd(toDateTimeLocalInput(electionInfo.endTime));
    setIsPeriodModalOpen(true);
  }

  async function handleUpdatePeriod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!anchorWallet || !isAdmin) {
      setPeriodError("Connect the election-admin wallet first.");
      return;
    }

    const startTime = Math.floor(new Date(periodStart).getTime() / 1000);
    const endTime = Math.floor(new Date(periodEnd).getTime() / 1000);

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      setPeriodError("Enter valid start and end dates.");
      return;
    }

    if (startTime >= endTime) {
      setPeriodError("The start time must be before the end time.");
      return;
    }

    try {
      setIsUpdatingPeriod(true);
      setPeriodError(null);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.updateElectionPeriod(new BN(startTime), new BN(endTime))
        .accountsPartial({
          election: ELECTION_ADDRESS,
        })
        .rpc();

      await loadDashboard();
      setIsPeriodModalOpen(false);
    } catch (error) {
      console.error("Update voting period failed:", error);
      setPeriodError("Unable to update the voting period.");
    } finally {
      setIsUpdatingPeriod(false);
    }
  }

  function openTransferModal() {
    setNewAdminAddress("");
    setTransferError(null);
    setIsTransferModalOpen(true);
  }

  async function handleTransferAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!anchorWallet || !publicKey || !isAdmin) {
      setTransferError("Connect the current election-admin wallet first.");
      return;
    }

    let newAdmin: PublicKey;

    try {
      newAdmin = new PublicKey(newAdminAddress.trim());
    } catch {
      setTransferError("Enter a valid Solana wallet address.");
      return;
    }

    if (!PublicKey.isOnCurve(newAdmin.toBytes())) {
      setTransferError("The new admin must be a wallet address, not a PDA.");
      return;
    }

    if (newAdmin.equals(publicKey)) {
      setTransferError("This wallet is already the election admin.");
      return;
    }

    try {
      setIsTransferringAdmin(true);
      setTransferError(null);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.transferAdmin(newAdmin)
        .accountsPartial({
          election: ELECTION_ADDRESS,
        })
        .rpc();

      await loadDashboard();
      setIsTransferModalOpen(false);
    } catch (error) {
      console.error("Transfer admin failed:", error);
      setTransferError("Unable to transfer admin ownership.");
    } finally {
      setIsTransferringAdmin(false);
    }
  }

  function openCloseModal() {
    setCloseError(null);
    setIsCloseModalOpen(true);
  }

  async function handleCloseElection() {
    if (!anchorWallet || !isAdmin) {
      setCloseError("Connect the election-admin wallet first.");
      return;
    }

    try {
      setIsClosingElection(true);
      setCloseError(null);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.closeElection()
        .accountsPartial({
          election: ELECTION_ADDRESS,
        })
        .rpc();

      await loadDashboard();
      setIsCloseModalOpen(false);
    } catch (error) {
      console.error("Close election failed:", error);
      setCloseError("Unable to close this election.");
    } finally {
      setIsClosingElection(false);
    }
  }

  async function approveVoter(id: number) {
    const voter = voters.find((item) => item.id === id);

    if (!voter || !anchorWallet || !isAdmin) {
      setActionError("Connect the election-admin wallet before approving.");
      return;
    }

    try {
      setActionError(null);
      setProcessingPda(voter.pda);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.approveVoter("Approved by admin.")
        .accountsPartial({
          election: ELECTION_ADDRESS,
          voter: new PublicKey(voter.pda),
        })
        .rpc();

      await loadDashboard();
    } catch (error) {
      console.error("Approve voter failed:", error);
      setActionError("Unable to approve this voter.");
    } finally {
      setProcessingPda(null);
    }
  }

  async function rejectVoter(id: number) {
    const voter = voters.find((item) => item.id === id);

    if (!voter || !anchorWallet || !isAdmin) {
      setActionError("Connect the election-admin wallet before rejecting.");
      return;
    }

    try {
      setActionError(null);
      setProcessingPda(voter.pda);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.rejectVoter("Registration rejected by admin.")
        .accountsPartial({
          election: ELECTION_ADDRESS,
          voter: new PublicKey(voter.pda),
        })
        .rpc();

      await loadDashboard();
    } catch (error) {
      console.error("Reject voter failed:", error);
      setActionError("Unable to reject this voter.");
    } finally {
      setProcessingPda(null);
    }
  }

  async function approveCandidate(id: number) {
    const candidate = candidates.find((item) => item.id === id);

    if (!candidate || !anchorWallet || !isAdmin) {
      setActionError("Connect the election-admin wallet before approving.");
      return;
    }

    try {
      setActionError(null);
      setProcessingPda(candidate.pda);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.approveCandidate("Approved by admin.")
        .accountsPartial({
          election: ELECTION_ADDRESS,
          candidate: new PublicKey(candidate.pda),
        })
        .rpc();

      await loadDashboard();
    } catch (error) {
      console.error("Approve candidate failed:", error);
      setActionError("Unable to approve this candidate.");
    } finally {
      setProcessingPda(null);
    }
  }

  async function rejectCandidate(id: number) {
    const candidate = candidates.find((item) => item.id === id);

    if (!candidate || !anchorWallet || !isAdmin) {
      setActionError("Connect the election-admin wallet before rejecting.");
      return;
    }

    try {
      setActionError(null);
      setProcessingPda(candidate.pda);

      await getVotingProgramWithWallet(anchorWallet)
        .methods.rejectCandidate("Registration rejected by admin.")
        .accountsPartial({
          election: ELECTION_ADDRESS,
          candidate: new PublicKey(candidate.pda),
        })
        .rpc();

      await loadDashboard();
    } catch (error) {
      console.error("Reject candidate failed:", error);
      setActionError("Unable to reject this candidate.");
    } finally {
      setProcessingPda(null);
    }
  }

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] px-6 py-20 text-center text-slate-400">
        Checking admin access...
      </div>
    );
  }

  if (!publicKey || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] px-6 py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-red-500/25 bg-red-500/10 p-8">
          <FaExclamationCircle className="mx-auto mb-4 text-4xl text-red-400" />
          <h1 className="text-2xl font-bold text-slate-100">
            Admin access only
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Connect the wallet that created this election to manage voters and
            candidates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-cyan-400 mb-1">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-base">
              Manage voters, candidates, and voting periods
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-400/20 transition-colors"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loadError && <ErrorToast message={loadError} />}

        {actionError && <ErrorToast message={actionError} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-7 px-4 text-center gap-2"
            >
              {s.icon}
              <span className="text-4xl font-extrabold text-slate-100">
                {s.value}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {s.label}
              </span>
              {s.sub && (
                <span className="text-xs text-orange-400 font-semibold">
                  {s.sub}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Contract Information */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-100 mb-5">
            Contract Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Owner Address</span>
              <span className="text-sm text-cyan-400 font-medium">
                {electionInfo ? shortenAddress(electionInfo.admin) : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Your Address</span>
              <span className="text-sm text-cyan-400 font-medium">
                {publicKey
                  ? shortenAddress(publicKey.toBase58())
                  : "Not connected"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Voting Start</span>
              <span className="text-sm text-slate-200">
                {electionInfo ? formatDate(electionInfo.startTime) : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Voting End</span>
              <span className="text-sm text-slate-200">
                {electionInfo ? formatDate(electionInfo.endTime) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100 mb-5">
            <FaCog className="text-slate-400" /> Admin Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openPeriodModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <FaClock /> Set Voting Period
            </button>
            <button
              onClick={openTransferModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-slate-200 font-semibold text-sm hover:bg-white/[0.1] transition-colors"
            >
              <FaCog /> Change Owner
            </button>
            <button
              onClick={openCloseModal}
              disabled={!electionInfo?.isActive}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/80 text-white font-semibold text-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaTimes /> Close Election
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(["voters", "candidates"] as const).map((tab) => {
            const pendingCount =
              tab === "voters"
                ? pendingVoters.length
                : pendingCandidates.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all
                  ${
                    activeTab === tab
                      ? "bg-cyan-400 text-[#0d1117]"
                      : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-400 text-[#0d1117] text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "voters" ? (
          <VotersTab
            voters={voters}
            pendingVoters={pendingVoters}
            onApprove={approveVoter}
            onReject={rejectVoter}
            processingPda={processingPda}
          />
        ) : (
          <CandidatesTab
            candidates={candidates}
            pendingCandidates={pendingCandidates}
            onApprove={approveCandidate}
            onReject={rejectCandidate}
            processingPda={processingPda}
          />
        )}
      </main>
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121821] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Set Voting Period
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Update when voting starts and ends.
                </p>
              </div>

              <button
                onClick={() => setIsPeriodModalOpen(false)}
                className="text-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdatePeriod} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Voting Start
                </label>
                <input
                  required
                  type="datetime-local"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Voting End
                </label>
                <input
                  required
                  type="datetime-local"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
                />
              </div>

              {periodError && <ErrorToast message={periodError} />}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPeriodModalOpen(false)}
                  className="rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingPeriod}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPeriod ? "Updating..." : "Save Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121821] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Transfer Admin Ownership
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Enter the wallet address that should control this election.
                </p>
              </div>

              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-sm leading-relaxed text-orange-200">
              This takes effect immediately. The current admin wallet will lose
              approval and management permission after confirmation.
            </div>

            <form onSubmit={handleTransferAdmin} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New Admin Wallet Address
                </label>

                <input
                  required
                  value={newAdminAddress}
                  onChange={(event) => setNewAdminAddress(event.target.value)}
                  placeholder="Enter a Solana wallet address"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 font-mono text-sm text-slate-100 outline-none placeholder:font-sans placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </div>

              {transferError && <ErrorToast message={transferError} />}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isTransferringAdmin}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTransferringAdmin
                    ? "Transferring..."
                    : "Transfer Ownership"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/25 bg-[#121821] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Close Election
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  This immediately ends voting and prevents new registrations.
                </p>
              </div>

              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200">
              This action cannot be undone by the current smart contract. Create
              a new election when you want to run another vote.
            </div>

            {closeError && <ErrorToast message={closeError} />}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleCloseElection()}
                disabled={isClosingElection}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isClosingElection ? "Closing..." : "Close Election"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Voters Tab ─────────────────────────────────────────── */
function VotersTab({
  voters,
  pendingVoters,
  onApprove,
  onReject,
  processingPda,
}: {
  voters: Voter[];
  pendingVoters: Voter[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processingPda: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      {pendingVoters.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 mb-4">
            <FaExclamationCircle className="text-orange-400" />
            Pending Approvals ({pendingVoters.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingVoters.map((v) => (
              <VoterCard
                key={v.id}
                voter={v}
                showActions
                onApprove={() => onApprove(v.id)}
                onReject={() => onReject(v.id)}
                processingPda={processingPda}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          All Voters ({voters.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voters.map((v) => (
            <VoterCard key={v.id} voter={v} showActions={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Candidates Tab ─────────────────────────────────────── */
function CandidatesTab({
  candidates,
  pendingCandidates,
  onApprove,
  onReject,
  processingPda,
}: {
  candidates: Candidate[];
  pendingCandidates: Candidate[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processingPda: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      {pendingCandidates.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 mb-4">
            <FaExclamationCircle className="text-orange-400" />
            Pending Approvals ({pendingCandidates.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingCandidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                showActions
                onApprove={() => onApprove(c.id)}
                onReject={() => onReject(c.id)}
                processingPda={processingPda}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          All Candidates ({candidates.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} showActions={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Voter Card ─────────────────────────────────────────── */
function VoterCard({
  voter,
  showActions,
  onApprove,
  onReject,
  processingPda = null,
}: {
  voter: Voter;
  showActions: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  processingPda?: string | null;
}) {
  const { id, name, address, voted, bio, message, status, avatar } = voter;
  return (
    <div className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 gap-3 hover:border-white/[0.13] transition-colors">
      <div className="flex items-center gap-3 relative">
        <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/40 to-blue-600/40 flex items-center justify-center text-lg font-bold text-cyan-300">
              {name[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-slate-100 text-base">{name}</p>
          <p className="text-xs text-slate-500">ID: #{id}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="text-sm">
        <span className="text-slate-500">Address: </span>
        <span className="text-cyan-400 font-medium">{address}</span>
      </div>
      <div className="text-sm">
        <span className="text-slate-500">Voted: </span>
        <span className="text-slate-300">{voted ? "Yes" : "No"}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        <span className="text-slate-300 font-medium">Bio: </span>
        {bio}
      </p>
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
        <p className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300">Message: </span>
          <span className="text-cyan-400">{message}</span>
        </p>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={onApprove}
            disabled={processingPda !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/80 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
          >
            <FaCheck className="text-xs" />
            {processingPda === voter.pda ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={onReject}
            disabled={processingPda !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
          >
            <FaTimes className="text-xs" />
            {processingPda === voter.pda ? "Processing..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Candidate Card ─────────────────────────────────────── */
function CandidateCard({
  candidate,
  showActions,
  onApprove,
  onReject,
  processingPda = null,
}: {
  candidate: Candidate;
  showActions: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  processingPda?: string | null;
}) {
  const { id, name, address, about, message, totalVotes, status, avatar } =
    candidate;
  return (
    <div className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 gap-3 hover:border-white/[0.13] transition-colors">
      <div className="flex items-center gap-3 relative">
        <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/40 to-blue-600/40 flex items-center justify-center text-lg font-bold text-cyan-300">
              {name[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-slate-100 text-base">{name}</p>
          <p className="text-xs text-slate-500">ID: #{id}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="text-sm">
        <span className="text-slate-500">Address: </span>
        <span className="text-cyan-400 font-medium">{address}</span>
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
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5">
        <span className="text-sm text-slate-400 font-medium">Total Votes</span>
        <span className="text-xl font-extrabold text-slate-100">
          {totalVotes}
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={onApprove}
            disabled={processingPda !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/80 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
          >
            <FaCheck className="text-xs" />
            {processingPda === candidate.pda ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={onReject}
            disabled={processingPda !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
          >
            <FaTimes className="text-xs" />
            {processingPda === candidate.pda ? "Processing..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const map: Record<
    Status,
    { style: string; icon: React.ReactNode; label: string }
  > = {
    approved: {
      style: "bg-green-500/15 border-green-500/30 text-green-400",
      icon: <FaCheck className="text-[10px]" />,
      label: "Approved",
    },
    pending: {
      style: "bg-orange-400/15 border-orange-400/30 text-orange-400",
      icon: <FaClock className="text-[10px]" />,
      label: "Pending",
    },
    rejected: {
      style: "bg-red-500/15 border-red-500/30 text-red-400",
      icon: <FaTimes className="text-[10px]" />,
      label: "Rejected",
    },
  };
  const { style, icon, label } = map[status];
  return (
    <span
      className={`absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${style}`}
    >
      {icon} {label}
    </span>
  );
}
