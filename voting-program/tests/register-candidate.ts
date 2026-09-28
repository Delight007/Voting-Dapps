import { Program } from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import idl from "../target/idl/voting_program.json";
import type { VotingProgram } from "../target/types/voting_program";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const program = new Program<VotingProgram>(idl as VotingProgram, {
    connection,
  });

  const election = new PublicKey(
    "FeeGRFquJJHKmkTvzqbrFyTzKbkEmE5ntRvC7mBMTUDG",
  );

  // A separate wallet represents the candidate.
  const candidateWallet = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    candidateWallet.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature, "confirmed");

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("candidate"),
      election.toBuffer(),
      candidateWallet.publicKey.toBuffer(),
    ],
    new PublicKey(idl.address),
  );

  const instruction = await program.methods
    .registerCandidate(
      "Ada Candidate",
      "A candidate registered for the local Anchor test election.",
      "https://example.com/ada-avatar.png",
    )
    .accounts({
      election,
      candidateWallet: candidateWallet.publicKey,
    })
    .instruction();

  const signature = await connection.sendTransaction(
    new Transaction().add(instruction),
    [candidateWallet],
  );

  await connection.confirmTransaction(signature, "confirmed");

  const candidateAccount = await program.account.candidate.fetch(candidatePda);

  console.log("Transaction signature:", signature);
  console.log("Candidate wallet:", candidateWallet.publicKey.toBase58());
  console.log("Candidate PDA:", candidatePda.toBase58());
  console.log("Candidate data:", candidateAccount);
}

main().catch(console.error);
