# VoteChain — Decentralized Voting Platform

A full-stack decentralized voting application built on **Solana** using **Rust, Anchor, and Next.js**.

VoteChain allows users to register as voters or candidates, participate in elections, and securely cast votes through a Solana smart contract. Election administration and voting logic are handled on-chain, while the frontend provides a modern interface for interacting with the program.

## Overview

VoteChain was built to explore how decentralized applications can handle real-world voting workflows using blockchain infrastructure.

The application separates responsibilities between:

- **Next.js frontend** — user interface and wallet interaction
- **Solana program** — election and voting logic
- **Anchor framework** — smart contract development and account management
- **Solana PDAs** — deterministic on-chain accounts for elections, voters, and candidates
- **Cloudinary** — image/avatar uploads
- **Wallet Adapter** — Solana wallet connection

The project is currently deployed to **Solana Devnet**.

---

## Features

### Voter Registration

Users can register as voters and create their voting profile.

Each voter has an on-chain account containing information such as:

- Wallet address
- Name
- Bio
- Avatar
- Voting status
- Approval status
- Whether they have already voted

### Candidate Registration

Users can register as candidates for an election.

Candidate information includes:

- Wallet address
- Name
- About
- Avatar
- Vote count
- Approval status
- Administrator message

### Admin Management

The election administrator can:

- Review candidates
- Approve candidates
- Reject candidates
- Provide an administrative message
- Manage the election lifecycle

### Decentralized Voting

Approved voters can cast votes through the Solana program.

The smart contract handles:

- Vote validation
- Voter verification
- Candidate verification
- Duplicate-vote prevention
- Vote counting

### Election Lifecycle

The program supports an election lifecycle including:

1. Election initialization
2. Voter registration
3. Candidate registration
4. Candidate approval
5. Voting
6. Election closure
7. Results

### Wallet Integration

Users interact with the application using a Solana-compatible wallet.

The connected wallet acts as the user's blockchain identity when interacting with the program.

### Candidate & Voter Profiles

Users can view their profile information and election participation status.

### Results Dashboard

The application provides a results interface displaying candidate voting information and election results.

---

## Application Flow

```text
                    ┌──────────────────┐
                    │   Connect Wallet  │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌────────────────┐
        │ Register      │         │ Register       │
        │ as Voter      │         │ as Candidate   │
        └───────┬───────┘         └───────┬────────┘
                │                         │
                │                         ▼
                │                 ┌────────────────┐
                │                 │ Admin Review   │
                │                 └───────┬────────┘
                │                         │
                │                  ┌──────┴──────┐
                │                  │             │
                │                  ▼             ▼
                │              Approved      Rejected
                │                  │
                └──────────┬───────┘
                           ▼
                  ┌─────────────────┐
                  │   Active Vote   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Cast Vote       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Election Results│
                  └─────────────────┘
```

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Icons
- Solana Wallet Adapter
- `@solana/web3.js`
- Anchor client

### Blockchain

- Solana
- Rust
- Anchor Framework
- Program Derived Addresses (PDAs)
- Solana Accounts
- SOL / Lamports

### Storage & Services

- Cloudinary
- Solana Devnet

---

## Smart Contract Architecture

The Solana program is written in Rust using Anchor.

### Program Structure

```text
voting-program/
├── programs/
│   └── voting-program/
│       └── src/
│           ├── lib.rs
│           ├── constants.rs
│           ├── errors.rs
│           ├── state.rs
│           └── instructions/
│               ├── initialize_election.rs
│               ├── register_candidate.rs
│               ├── approve_candidate.rs
│               ├── reject_candidate.rs
│               ├── cast_vote.rs
│               └── close_election.rs
│
├── Anchor.toml
├── Cargo.toml
└── Cargo.lock
```

### Program Instructions

The program currently exposes the following instructions:

```text
initialize_election
register_candidate
approve_candidate
reject_candidate
cast_vote
close_election
```

---

## Program Accounts

VoteChain uses Program Derived Addresses to create deterministic accounts for election participants.

### Election PDA

```text
[election]
```

Stores the main election information.

### Voter PDA

```text
[voter, election, voter_wallet]
```

Stores voter registration and voting information.

### Candidate PDA

```text
[candidate, election, candidate_wallet]
```

Stores candidate registration and vote information.

This structure allows the program to maintain separate on-chain state for each participant while associating them with a specific election.

---

## Security & Validation

The program performs on-chain validation before modifying election state.

Examples include:

- Only the election administrator can approve or reject candidates.
- A voter must be registered before voting.
- Candidates must be approved before receiving votes.
- A voter cannot vote more than once.
- Voting is only allowed while the election is active.
- Election accounts are associated with their expected administrator.
- PDA seeds ensure accounts are derived deterministically.

---

## Project Structure

The repository contains both the frontend and Solana program:

```text
voting-dapps/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── voting-program/
│   ├── programs/
│   ├── tests/
│   ├── Anchor.toml
│   ├── Cargo.toml
│   └── ...
│
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Rust
- Solana CLI
- Anchor CLI
- A Solana wallet such as Phantom

---

## Clone the Repository

```bash
git clone <your-repository-url>

cd voting-dapps
```

---

# Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_VOTING_PROGRAM_ID=YOUR_PROGRAM_ID
NEXT_PUBLIC_ELECTION_ADDRESS=YOUR_ELECTION_ADDRESS

NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=YOUR_UPLOAD_PRESET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# Solana Program Setup

Navigate to the Anchor project:

```bash
cd voting-program
```

Build the program:

```bash
anchor build
```

Run tests:

```bash
anchor test
```

For Devnet deployment, configure your Solana CLI:

```bash
solana config set --url https://api.devnet.solana.com
```

Then deploy:

```bash
anchor program deploy
```

---

## Deployment

The smart contract is deployed on **Solana Devnet**.

### Program ID

```text
DWBmTLQ8gcWeJGQJLunUWTKbAjrBiTeunDKyZ3hCCbFQ
```

### Network

```text
Solana Devnet
```

The frontend can be deployed using platforms such as Vercel.

---

## Environment Variables

Environment variables are intentionally excluded from version control.

Do not commit:

```text
.env
.env.local
.env.production
```

For production deployment, configure the required environment variables directly in the hosting platform.

---

## Why Solana?

VoteChain uses Solana because its account-based architecture and low transaction costs make it suitable for applications that require frequent state updates.

The project also demonstrates several important Solana development concepts:

- Wallet-based identity
- Transactions
- Instructions
- Accounts
- PDAs
- Program ownership
- On-chain state
- Account constraints
- Rust smart contracts
- Anchor
- Devnet deployment

---

## What I Learned

This project provided hands-on experience with building and deploying a Solana program from the ground up.

Key concepts explored include:

- Rust fundamentals for Solana development
- Anchor framework
- Program architecture
- Instructions and handlers
- Account contexts
- PDA derivation
- Seeds and bumps
- Account initialization
- Account sizing
- Program errors
- Authorization
- Wallet integration
- Solana transactions
- Devnet deployment
- Frontend-to-program integration

---

## Future Improvements

Potential improvements include:

- Multiple election support
- Election creation through the frontend
- More advanced election permissions
- Token-based voting
- NFT-based voter identity
- Improved governance mechanisms
- Election analytics
- Transaction history
- On-chain event indexing
- Production-grade deployment
- Mainnet deployment

---

## Disclaimer

VoteChain is a portfolio and educational blockchain application deployed on Solana Devnet.

It is not intended to be used as a production-grade public election system without additional security audits, governance mechanisms, identity verification, accessibility considerations, and infrastructure.

---

## Author

**Levi Lafiya Gana**

Frontend Engineer | Full Stack Developer | Solana / Web3 Developer

- GitHub: https://github.com/Delight007
- LinkedIn: https://www.linkedin.com/in/levi-gana-462102348/

---

## License

This project is available for educational and portfolio purposes.
