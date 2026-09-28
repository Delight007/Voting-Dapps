import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";

import { deriveCandidatePda, deriveVoterPda } from "./pads";
import {
  ELECTION_ADDRESS,
  getVotingProgram,
  getVotingProgramWithWallet,
} from "./solana";

export type CandidateVoterStatus = "Pending" | "Approved" | "Rejected";

function getStatusLabel(rawStatus: unknown): CandidateVoterStatus {
  if (rawStatus && typeof rawStatus === "object") {
    if ("approved" in rawStatus) return "Approved";
    if ("rejected" in rawStatus) return "Rejected";
  }
  return "Pending";
}

export type OnChainElection = {
  title: string;
  description: string;
  admin: PublicKey;
  isActive: boolean;
  startTime: number;
  endTime: number;
  totalCandidates: number;
  totalVoters: number;
};

export async function fetchElection(): Promise<OnChainElection> {
  const program = getVotingProgram();
  const raw = (await program.account.election.fetch(
    ELECTION_ADDRESS,
  )) as unknown as {
    title: string;
    description: string;
    admin: PublicKey;
    isActive: boolean;
    startTime: { toNumber: () => number };
    endTime: { toNumber: () => number };
    totalCandidates: { toNumber: () => number } | number;
    totalVoters: { toNumber: () => number } | number;
  };

  const toNum = (v: { toNumber: () => number } | number) =>
    typeof v === "number" ? v : v.toNumber();

  return {
    title: raw.title,
    description: raw.description,
    admin: raw.admin,
    isActive: raw.isActive,
    startTime: raw.startTime.toNumber(),
    endTime: raw.endTime.toNumber(),
    totalCandidates: toNum(raw.totalCandidates),
    totalVoters: toNum(raw.totalVoters),
  };
}

export type OnChainVoter = {
  publicKey: PublicKey;
  wallet: PublicKey;
  name: string;
  bio: string;
  hasVoted: boolean;
  status: CandidateVoterStatus;
  adminMessage: string;
  avatarUrl: string;
};

export async function fetchVoter(
  walletPubkey: PublicKey,
): Promise<OnChainVoter | null> {
  const program = getVotingProgram();
  const [voterPda] = deriveVoterPda(walletPubkey);

  try {
    const raw = (await program.account.voter.fetch(voterPda)) as unknown as {
      wallet: PublicKey;
      name: string;
      bio: string;
      hasVoted: boolean;
      status: unknown;
      adminMessage: string;
      avatarUrl: string;
    };

    return {
      publicKey: voterPda,
      wallet: raw.wallet,
      name: raw.name,
      bio: raw.bio,
      hasVoted: raw.hasVoted,
      status: getStatusLabel(raw.status),
      adminMessage: raw.adminMessage,
      avatarUrl: raw.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function registerVoter(
  wallet: AnchorWallet,
  params: { name: string; bio: string; avatarUrl: string },
) {
  const program = getVotingProgramWithWallet(wallet);

  // `voter` is left out on purpose — Anchor auto-derives it from
  // [VOTER_SEED, election, voterWallet], both of which we pass below.
  return program.methods
    .registerVoter(params.name, params.bio, params.avatarUrl)
    .accounts({
      election: ELECTION_ADDRESS,
      voterWallet: wallet.publicKey,
    })
    .rpc();
}

export async function castVote(
  wallet: AnchorWallet,
  candidateWallet: PublicKey,
) {
  const program = getVotingProgramWithWallet(wallet);
  const [candidatePda] = deriveCandidatePda(candidateWallet);

  // Supply both PDAs explicitly because castVote uses the voter wallet and
  // the stored candidate wallet in its account seeds.
  return program.methods
    .castVote()
    .accountsStrict({
      election: ELECTION_ADDRESS,
      voter: deriveVoterPda(wallet.publicKey)[0],
      candidate: candidatePda,
      voterWallet: wallet.publicKey,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
}

export function getReadableVoteError(err: unknown): string {
  const code = (err as { error?: { errorCode?: { code?: string } } })?.error
    ?.errorCode?.code;

  switch (code) {
    case "ElectionNotActive":
      return "This election isn't active right now.";
    case "ElectionNotStarted":
      return "Voting hasn't started yet.";
    case "ElectionEnded":
      return "Voting has already ended.";
    case "VoterNotApproved":
      return "Your voter registration hasn't been approved yet.";
    case "CandidateNotApproved":
      return "This candidate hasn't been approved.";
    case "AlreadyVoted":
      return "You've already voted in this election.";
    case "InvalidVoterStatus":
      return "Your voter account is in an unexpected state. Contact the admin.";
    default:
      return "Something went wrong submitting your vote. Please try again.";
  }
}
