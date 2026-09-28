import { Program } from "@anchor-lang/core";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import idl from "../target/idl/voting_program.json";
import type { VotingProgram } from "../target/types/voting_program";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const admin = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        readFileSync(join(homedir(), ".config", "solana", "id.json"), "utf8"),
      ),
    ),
  );

  const program = new Program<VotingProgram>(idl as VotingProgram, {
    connection,
  });

  const election = Keypair.generate();
  const now = Math.floor(Date.now() / 1000);

  // Intentionally invalid: the election ends before it starts.
  const startTime = new BN(now + 3_600);
  const endTime = new BN(now);

  const instruction = await program.methods
    .initializeElection(
      "Invalid Time Election",
      "This test must fail.",
      startTime,
      endTime,
    )
    .accountsPartial({
      election: election.publicKey,
      admin: admin.publicKey,
    })
    .instruction();

  const transaction = new Transaction().add(instruction);

  try {
    await connection.sendTransaction(transaction, [admin, election]);

    console.log("Unexpected success: the program accepted invalid times.");
  } catch (error) {
    console.log("Expected failure: invalid election time was rejected.");
    console.log(error);
  }
}

main().catch(console.error);
