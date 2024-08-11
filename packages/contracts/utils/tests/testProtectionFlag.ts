import type { Idl, Program } from "@coral-xyz/anchor";

const DEFAULT_LOCALHOST_RPCS = [
  "http://127.0.0.1:8899",
  "http://localhost:8899",
];

/**
 * Enforces network protection by checking if the program is being run on localhost.
 * Explicitly disable this check by setting `disableCheck` to `true`.
 */
export const enforceNetworkProtection = <T extends Idl>(
  program: Program<T>,
  disableCheck = false,
) => {
  if (
    !disableCheck &&
    !DEFAULT_LOCALHOST_RPCS.includes(program.provider.connection.rpcEndpoint)
  ) {
    throw new Error(
      "NETWORK PROTECTION: CANNOT RUN TESTS ON NON-LOCALHOST NETWORKS",
    );
  }
};
