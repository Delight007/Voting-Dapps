"use client";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo, type ReactNode } from "react";

type SolanaProviderProps = {
  children: ReactNode;
};

export default function SolanaProvider({ children }: SolanaProviderProps) {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://127.0.0.1:8899";

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
