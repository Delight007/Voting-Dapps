import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { Program } from "@anchor-lang/core";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import idl from "../target/idl/voting_program.json";
import type { VotingProgram } from "../target/types/voting_program";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const voterKeypairPath = join(homedir(), ".config", "solana", "id.json");

  const voterWallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(voterKeypairPath, "utf8"))),
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

  const [voterPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("voter"),
      election.toBuffer(),
      voterWallet.publicKey.toBuffer(),
    ],
    new PublicKey(idl.address),
  );

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("candidate"), election.toBuffer(), candidateWallet.toBuffer()],
    new PublicKey(idl.address),
  );

  const instruction = await program.methods
    .castVote()
    .accountsPartial({
      election,
      voter: voterPda,
      candidate: candidatePda,
      voterWallet: voterWallet.publicKey,
    })
    .instruction();

  const signature = await connection.sendTransaction(
    new Transaction().add(instruction),
    [voterWallet],
  );

  await connection.confirmTransaction(signature, "confirmed");

  const voterAccount = await program.account.voter.fetch(voterPda);
  const candidateAccount = await program.account.candidate.fetch(candidatePda);

  console.log("Transaction signature:", signature);
  console.log("Voter has voted:", voterAccount.hasVoted);
  console.log("Candidate vote count:", candidateAccount.voteCount.toString());
}

main().catch(console.error);
