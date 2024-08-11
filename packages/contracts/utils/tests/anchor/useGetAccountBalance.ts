import type { Connection } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const useGetAccountBalance = (connection: Connection) => {
  const getBalance = async (walletAddress: PublicKey | string) => {
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    return {
      balance,
      balanceUI: balance / LAMPORTS_PER_SOL,
    };
  };

  return { getBalance };
};
