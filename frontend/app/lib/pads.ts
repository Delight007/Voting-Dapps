import { PublicKey } from "@solana/web3.js";
import { ELECTION_ADDRESS, VOTING_PROGRAM_ID } from "./solana";

// Must match constants.rs exactly.
const CANDIDATE_SEED = Buffer.from("candidate");
const VOTER_SEED = Buffer.from("voter");

/** [VOTER_SEED, election, voter_wallet] — from RegisterVoter/CastVote accounts. */
export function deriveVoterPda(voterWallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VOTER_SEED, ELECTION_ADDRESS.toBuffer(), voterWallet.toBuffer()],
    VOTING_PROGRAM_ID,
  );
}

/** [CANDIDATE_SEED, election, candidate_wallet] — from RegisterCandidate/CastVote accounts. */
export function deriveCandidatePda(
  candidateWallet: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [CANDIDATE_SEED, ELECTION_ADDRESS.toBuffer(), candidateWallet.toBuffer()],
    VOTING_PROGRAM_ID,
  );
}
