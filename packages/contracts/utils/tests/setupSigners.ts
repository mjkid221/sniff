import type { Idl, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

import { airdropSol } from "../airdropSolana";

type DEFAULT_NAMED_USER =
  | "deployer"
  | "alice"
  | "bob"
  | "carol"
  | "david"
  | "eve"
  | "frank"
  | "grace"
  | "harry"
  | "ian";

const namedAccounts: DEFAULT_NAMED_USER[] = [
  "deployer",
  "alice",
  "bob",
  "carol",
  "david",
  "eve",
  "frank",
  "grace",
  "harry",
  "ian",
];

const namedSigners: Record<string, Keypair> = {};
for (const name of namedAccounts) {
  namedSigners[name] = Keypair.generate();
}

export const getNamedAccounts = <T extends Idl>(program?: Program<T>) => {
  // generate a new keypair per named accounts
  const accounts: Record<string, Keypair> = {
    ...namedSigners,
  };

  const defaultKeypair =
    (
      program?.provider as unknown as
        | { wallet?: { payer?: Keypair } }
        | undefined
    )?.wallet?.payer ?? accounts.deployer;
  accounts.deployer = defaultKeypair;

  return accounts as Record<DEFAULT_NAMED_USER, Keypair>;
};

export const getSigners = <T extends Idl>(program?: Program<T>) => {
  const accounts = getNamedAccounts(program);
  return Object.values(accounts);
};

export const setupSignersInitialBalance = async <T extends Idl>(
  program: Program<T>,
) => {
  try {
    for (const name of Object.keys(namedSigners)) {
      // TODO: refactor to use batched tx request, but may not make much difference in local
      await airdropSol(
        program.provider.connection,
        1000,
        namedSigners[name].publicKey,
      );
    }
  } catch {
    // ignore
  }
};
