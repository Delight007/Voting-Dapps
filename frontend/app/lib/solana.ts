// import { Program } from "@anchor-lang/core";
// import { Connection, PublicKey } from "@solana/web3.js";

// import type { VotingProgram } from "./voting_program";
// import idl from "./voting_program.json";

// const rpcUrl =
//   process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://127.0.0.1:8899";

// const programId = process.env.NEXT_PUBLIC_VOTING_PROGRAM_ID;
// const electionAddress = process.env.NEXT_PUBLIC_ELECTION_ADDRESS;

// if (!programId || !electionAddress) {
//   throw new Error("Missing Solana program configuration.");
// }

// export const connection = new Connection(rpcUrl, "confirmed");

// export const VOTING_PROGRAM_ID = new PublicKey(programId);

// export const ELECTION_ADDRESS = new PublicKey(electionAddress);

// export function getVotingProgram() {
//   return new Program<VotingProgram>(idl as unknown as VotingProgram, {
//     connection,
//   });
// }

import { AnchorProvider, Program } from "@anchor-lang/core";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

import type { VotingProgram } from "./voting_program";
import idl from "./voting_program.json";

const rpcUrl =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://127.0.0.1:8899";

const programId = process.env.NEXT_PUBLIC_VOTING_PROGRAM_ID;
const electionAddress = process.env.NEXT_PUBLIC_ELECTION_ADDRESS;

if (!programId || !electionAddress) {
  throw new Error("Missing Solana program configuration.");
}

export const connection = new Connection(rpcUrl, "confirmed");

export const VOTING_PROGRAM_ID = new PublicKey(programId);

export const ELECTION_ADDRESS = new PublicKey(electionAddress);

const VOTER_SEED = new TextEncoder().encode("voter");
const CANDIDATE_SEED = new TextEncoder().encode("candidate");

export function getVoterPda(voterWallet: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [VOTER_SEED, ELECTION_ADDRESS.toBuffer(), voterWallet.toBuffer()],
    VOTING_PROGRAM_ID,
  )[0];
}

export function getCandidatePda(candidateWallet: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [CANDIDATE_SEED, ELECTION_ADDRESS.toBuffer(), candidateWallet.toBuffer()],
    VOTING_PROGRAM_ID,
  )[0];
}

/**
 * Read-only program instance. No wallet attached, so this can fetch
 * accounts (candidates, election, voter) but CANNOT sign or send
 * transactions. Use this for display/list pages.
 */
export function getVotingProgram() {
  return new Program<VotingProgram>(idl as unknown as VotingProgram, {
    connection,
  });
}

/**
 * Wallet-attached program instance. Pass it the `wallet` object you get
 * back from useAnchorWallet() (only available once SolanaProvider has
 * connected a wallet). Use this for anything that submits a transaction:
 * registerVoter, registerCandidate, castVote.
 */
export function getVotingProgramWithWallet(wallet: AnchorWallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program<VotingProgram>(idl as unknown as VotingProgram, provider);
}
