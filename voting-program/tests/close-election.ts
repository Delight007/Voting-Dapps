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

  const instruction = await program.methods
    .closeElection()
    .accountsPartial({
      election,
      admin: admin.publicKey,
    })
    .instruction();

  const signature = await connection.sendTransaction(
    new Transaction().add(instruction),
    [admin],
  );

  await connection.confirmTransaction(signature, "confirmed");

  const electionAccount = await program.account.election.fetch(election);

  console.log("Transaction signature:", signature);
  console.log("Election active:", electionAccount.isActive);
}

main().catch(console.error);
