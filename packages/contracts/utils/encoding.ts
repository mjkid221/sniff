import { PublicKey } from "@solana/web3.js";
import { ec } from "elliptic";
import { TextEncoder } from "text-encoding";

import idl from "../target/idl/sniff.json";

export const getUserPDA = (seed: string, authority: PublicKey) => {
  const [PDA] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode(seed), authority.toBuffer()],
    new PublicKey(idl.address),
  );
  return PDA;
};

export const ellipticEDDSA = new ec("curve25519");
export const ellipticECDSA = new ec("secp256k1");
