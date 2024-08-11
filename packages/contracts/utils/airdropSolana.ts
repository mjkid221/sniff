import type { Connection } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

/**
 * Airdrops SOL to the specified address.
 * @param connection The connection to use.
 * @param amount The amount of SOL to airdrop. (e.g. 1 for 1 SOL)
 * @param to The address to airdrop to.
 */
export const airdropSol = async (
  connection: Connection,
  amount: number,
  to: string | PublicKey,
) => {
  const airdropSignature = await connection.requestAirdrop(
    new PublicKey(to),
    amount * LAMPORTS_PER_SOL,
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  return connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature: airdropSignature,
  });
};
