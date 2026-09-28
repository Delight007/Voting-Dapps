import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { Program } from "@anchor-lang/core";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import idl from "../target/idl/voting_program.json";
import type { VotingProgram } from "../target/types/voting_program";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const adminKeypairPath = join(homedir(), ".config", "solana", "id.json");

  const admin = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(adminKeypairPath, "utf8"))),
  );

  const program = new Program<VotingProgram>(idl as VotingProgram, {
    connection,
  });

  const election = new PublicKey(
    "FeeGRFquJJHKmkTvzqbrFyTzKbkEmE5ntRvC7mBMTUDG",
  );

  const candidateWallet = new PublicKey(
    "BY3PTAZM9LNRuCff1dans8XnLpWRqnxpKW3W8rSqQffx",
  );

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("candidate"), election.toBuffer(), candidateWallet.toBuffer()],
    new PublicKey(idl.address),
  );

  const instruction = await program.methods
    .approveCandidate("Approved for the local Anchor test election.")
    .accountsPartial({
      election,
      candidate: candidatePda,
      admin: admin.publicKey,
    })
    .instruction();

  const signature = await connection.sendTransaction(
    new Transaction().add(instruction),
    [admin],
  );

  await connection.confirmTransaction(signature, "confirmed");

  const candidateAccount = await program.account.candidate.fetch(candidatePda);

  console.log("Transaction signature:", signature);
  console.log("Candidate status:", candidateAccount.status);
  console.log("Admin message:", candidateAccount.adminMessage);
}

main().catch(console.error);
