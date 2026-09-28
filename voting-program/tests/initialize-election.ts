import { Program } from "@anchor-lang/core";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import idl from "../target/idl/voting_program.json";
import type { VotingProgram } from "../target/types/voting_program";

async function main() {
  console.log("1. Connecting to local validator...");
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const adminKeypairPath = join(homedir(), ".config", "solana", "id.json");

  const admin = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(adminKeypairPath, "utf8"))),
  );

  const program = new Program<VotingProgram>(idl as VotingProgram, {
    connection,
  });
  // Your election account is a normal account, so it needs a new keypair.
  const election = Keypair.generate();

  const now = Math.floor(Date.now() / 1000);
  const startTime = new BN(now - 60);
  const endTime = new BN(now + 24 * 60 * 60);
  console.log("2. Building initialize-election instruction...");
  const initializeInstruction = await program.methods
    .initializeElection(
      "FUT Minna Student Election",
      "A local test election for learning Anchor.",
      startTime,
      endTime,
    )
    .accounts({
      election: election.publicKey,
      admin: admin.publicKey,
    })
    .instruction();

  const transaction = new Transaction().add(initializeInstruction);
  const simulation = await connection.simulateTransaction(transaction, [
    admin,
    election,
  ]);

  console.log("Simulation error:", simulation.value.err);
  console.log("Simulation logs:", simulation.value.logs);

  if (simulation.value.err) {
    throw new Error("Transaction simulation failed.");
  }
  console.log("3. Sending transaction...");
  const signature = await connection.sendTransaction(transaction, [
    admin,
    election,
  ]);

  console.log("Transaction submitted:", signature);

  await connection.confirmTransaction(signature, "confirmed");
  console.log("4. Fetching created election account...");

  const electionAccount = await program.account.election.fetch(
    election.publicKey,
  );

  console.log("Transaction signature:", signature);
  console.log("Election address:", election.publicKey.toBase58());
  console.log("Election data:", electionAccount);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
