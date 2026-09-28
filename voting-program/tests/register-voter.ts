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

  const voterWallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(adminKeypairPath, "utf8"))),
  );

  const program = new Program<VotingProgram>(idl as VotingProgram, {
    connection,
  });

  const election = new PublicKey(
    "FeeGRFquJJHKmkTvzqbrFyTzKbkEmE5ntRvC7mBMTUDG",
  );

  const [voterPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("voter"),
      election.toBuffer(),
      voterWallet.publicKey.toBuffer(),
    ],
    new PublicKey(idl.address),
  );

  const registerVoterInstruction = await program.methods
    .registerVoter(
      "Levi Gana",
      "Computer Science student and eligible voter.",
      "https://example.com/levi-avatar.png",
    )
    .accounts({
      election,
      voterWallet: voterWallet.publicKey,
    })
    .instruction();

  const transaction = new Transaction().add(registerVoterInstruction);

  const signature = await connection.sendTransaction(transaction, [
    voterWallet,
  ]);

  await connection.confirmTransaction(signature, "confirmed");

  const voterAccount = await program.account.voter.fetch(voterPda);

  console.log("Transaction signature:", signature);
  console.log("Voter wallet:", voterWallet.publicKey.toBase58());
  console.log("Voter PDA:", voterPda.toBase58());
  console.log("Voter data:", voterAccount);
}

main().catch(console.error);
