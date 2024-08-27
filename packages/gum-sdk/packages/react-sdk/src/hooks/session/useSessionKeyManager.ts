import { useEffect, useRef, useState } from "react";
import { BN } from "@project-serum/anchor";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Cluster,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  deleteItemFromIndexedDB,
  getItemFromIndexedDB,
  setItemToIndexedDB,
} from "src/utils/indexedDB";
import * as nacl from "tweetnacl";

import { SessionTokenManager } from "@acme/gum-sdk";

import { decrypt, encrypt, generateEncryptionKey } from "../../utils/crypto";

export interface SessionWalletInterface {
  publicKey: PublicKey | null;
  ownerPublicKey: PublicKey | null;
  isLoading: boolean;
  error: string | null;
  sessionToken: string | null;
  signTransaction:
    | (<T extends Transaction>(transaction: T) => Promise<T>)
    | undefined;
  signAllTransactions:
    | (<T extends Transaction>(transactions: T[]) => Promise<T[]>)
    | undefined;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
  sendTransaction:
    | (<T extends Transaction>(
        transaction: T,
        connection?: Connection,
        options?: SendTransactionOptions,
      ) => Promise<string>)
    | undefined;
  signAndSendTransaction:
    | (<T extends Transaction>(
        transactions: T | T[],
        connection?: Connection,
        options?: SendTransactionOptions,
      ) => Promise<string[]>)
    | undefined;
  createSession: (
    targetProgram: PublicKey,
    topUp: boolean,
    validUntil?: number,
    sessionCreatedCallback?: (sessionInfo: {
      sessionToken: string;
      publicKey: string;
    }) => void,
  ) => Promise<SessionWalletInterface | undefined>;
  revokeSession: () => Promise<string | null>;
  getSessionToken: () => Promise<string | null>;
}

// Constants
const SESSION_OBJECT_STORE = "sessions";
const WALLET_PUBKEY_TO_SESSION_STORE = "walletPublicKeyToSessionData";
const ENCRYPTION_KEY_OBJECT_STORE = "user_preferences";

export function useSessionKeyManager(
  wallet: AnchorWallet,
  connection: Connection,
  cluster: Cluster | "localnet",
): SessionWalletInterface {
  const keypairRef = useRef<Keypair | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const [, forceUpdate] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sessionConnection = connection;

  const sdk = new SessionTokenManager(wallet, connection, cluster);

  // functions for keypair management
  const generateKeypair = () => {
    keypairRef.current = Keypair.generate();
  };

  const loadKeypairFromDecryptedSecret = (decryptedKeypair: string) => {
    keypairRef.current = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(decryptedKeypair, "base64")),
    );
  };

  const triggerRerender = () => {
    forceUpdate({});
  };

  useEffect(() => {
    if (!wallet) {
      return;
    }

    getSessionToken()
      .then((token) => {
        if (!token) {
          resetSessionData();
        }
      })
      .catch(() => {
        resetSessionData();
      });
  }, [wallet?.publicKey, cluster]);

  const deleteSessionData = async () => {
    try {
      const walletPublicKey = wallet.publicKey.toBase58();
      const sessionKey = await getItemFromIndexedDB(
        WALLET_PUBKEY_TO_SESSION_STORE,
        walletPublicKey,
      );

      if (sessionKey) {
        await deleteItemFromIndexedDB(SESSION_OBJECT_STORE, sessionKey);
        await deleteItemFromIndexedDB(
          WALLET_PUBKEY_TO_SESSION_STORE,
          walletPublicKey,
        );
      }

      await deleteItemFromIndexedDB(
        ENCRYPTION_KEY_OBJECT_STORE,
        walletPublicKey,
      );
    } catch (error: any) {
      console.error("Error deleting session data:", error);
      setError(error);
    }
  };

  const withLoading = async (asyncFunction: () => Promise<any>) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async <T extends Transaction>(
    transaction: T,
  ): Promise<T> => {
    return withLoading(async () => {
      if (!keypairRef.current || !sessionTokenRef.current) {
        throw new Error(
          "Cannot sign transaction - keypair or session token not loaded. Please create a session first.",
        );
      }

      const { blockhash } = await connection.getLatestBlockhash("finalized");
      const feePayer = keypairRef.current.publicKey;

      transaction.recentBlockhash = transaction.recentBlockhash || blockhash;
      transaction.feePayer = transaction.feePayer || feePayer;
      transaction.sign(keypairRef.current);

      return transaction;
    });
  };

  const signAllTransactions = async <T extends Transaction>(
    transactions: T[],
  ): Promise<T[]> => {
    return withLoading(async () => {
      return Promise.all(
        transactions.map((transaction) => signTransaction(transaction)),
      );
    });
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    return withLoading(async () => {
      if (!keypairRef.current) {
        throw new Error(
          "Cannot sign message - keypair not loaded. Please create a session first.",
        );
      }
      return nacl.sign.detached(message, keypairRef.current.secretKey);
    });
  };

  const sendTransaction = async (
    transaction: Transaction,
    connection?: Connection,
    options: SendTransactionOptions = {},
  ): Promise<string> => {
    return withLoading(async () => {
      const keypair = keypairRef.current;
      const sessionToken = sessionTokenRef.current;

      if (!connection) {
        connection = sessionConnection;
      }

      if (!keypair || !sessionToken) {
        throw new Error(
          "Cannot sign transaction - keypair or session token not loaded. Please create a session first.",
        );
      }

      const { signers, ...sendOptions } = options;
      const publicKey = keypair.publicKey;

      if (!publicKey) {
        throw new Error(
          "Cannot send transaction - keypair not loaded. Please create a session first.",
        );
      }

      transaction.feePayer = transaction.feePayer || publicKey;
      transaction.recentBlockhash =
        transaction.recentBlockhash ||
        (
          await connection.getLatestBlockhash({
            commitment: sendOptions.preflightCommitment,
            minContextSlot: sendOptions.minContextSlot,
          })
        ).blockhash;

      if (signers?.length) {
        transaction.partialSign(...signers);
      }

      transaction = await signTransaction(transaction);

      const txid = await connection.sendRawTransaction(
        transaction.serialize(),
        sendOptions,
      );
      return txid;
    });
  };

  const signAndSendTransaction = async (
    transaction: Transaction | Transaction[],
    connection?: Connection,
    options: SendTransactionOptions = {},
  ): Promise<string[]> => {
    return withLoading(async () => {
      if (!connection) {
        connection = sessionConnection;
      }
      const transactionsArray = Array.isArray(transaction)
        ? transaction
        : [transaction];
      const txids = await Promise.all(
        transactionsArray.map((signedTransaction) =>
          sendTransaction(signedTransaction, connection, options),
        ),
      );
      return txids;
    });
  };

  const getSessionToken = async (): Promise<string | null> => {
    try {
      const sessionKey = await getItemFromIndexedDB(
        WALLET_PUBKEY_TO_SESSION_STORE,
        wallet.publicKey.toString(),
      );

      if (!sessionKey) {
        resetSessionData();
        return null;
      }

      const encryptedSessionData = await getItemFromIndexedDB(
        SESSION_OBJECT_STORE,
        sessionKey,
      );
      const encryptionKey = await getItemFromIndexedDB(
        ENCRYPTION_KEY_OBJECT_STORE,
        wallet.publicKey.toString(),
      );

      if (!encryptedSessionData || !encryptionKey) {
        resetSessionData();
        return null;
      }

      if (encryptedSessionData && encryptionKey) {
        const { encryptedToken, encryptedKeypair, validUntilTimestamp } =
          encryptedSessionData;
        const {
          userPreferences: storedEncryptionKey,
          validUntilTimestamp: encryptionKeyExpiry,
        } = encryptionKey;

        const currentTimestamp = Math.ceil(Date.now() / 1000);

        if (
          currentTimestamp > encryptionKeyExpiry ||
          currentTimestamp > validUntilTimestamp
        ) {
          await deleteSessionData();
          return null;
        }

        const decryptedToken = decrypt(encryptedToken, storedEncryptionKey);
        const decryptedKeypair = decrypt(encryptedKeypair, storedEncryptionKey);

        loadKeypairFromDecryptedSecret(decryptedKeypair);

        sessionTokenRef.current = decryptedToken;
        triggerRerender();

        return decryptedToken;
      }
    } catch (error: any) {
      console.error("Error getting session data from IndexedDB:", error);
      setError(error);
    }

    return null;
  };

  const createSession = async (
    targetProgramPublicKey: PublicKey,
    topUp = false,
    expiryInMinutes = 60,
    sessionCreatedCallback?: (sessionInfo: {
      sessionToken: string;
      publicKey: string;
    }) => void,
  ): Promise<SessionWalletInterface> => {
    return withLoading(async () => {
      try {
        // if expiry is more than 24 hours then throw error
        if (expiryInMinutes > 24 * 60) {
          throw new Error("Expiry cannot be more than 24 hours.");
        }

        if (!keypairRef.current) {
          generateKeypair();
        }

        // default expiry is 60 minutes (1 hour)
        const expiryTimestamp = Math.ceil(
          (Date.now() + expiryInMinutes * 60 * 1000) / 1000,
        );

        const validUntilBN: BN | null = new BN(expiryTimestamp);

        const sessionKeypair: Keypair | null = keypairRef.current;
        if (!sessionKeypair) {
          throw new Error("Session keypair not generated.");
        }
        const sessionSignerPublicKey = sessionKeypair.publicKey;

        const instructionMethodBuilder = sdk.program.methods
          .createSession(topUp, validUntilBN)
          .accounts({
            targetProgram: targetProgramPublicKey,
            sessionSigner: sessionSignerPublicKey,
            authority: wallet.publicKey as PublicKey,
          });

        const pubKeys = await instructionMethodBuilder.pubkeys();
        const sessionToken = pubKeys.sessionToken as PublicKey;

        await instructionMethodBuilder.signers([sessionKeypair]).rpc();
        await deleteSessionData();

        const encryptionKey = generateEncryptionKey();

        const sessionTokenString = sessionToken.toBase58();
        const keypairSecretBase64String = Buffer.from(
          sessionKeypair.secretKey,
        ).toString("base64");

        const encryptedToken = encrypt(sessionTokenString, encryptionKey);
        const encryptedKeypair = encrypt(
          keypairSecretBase64String,
          encryptionKey,
        );

        const encryptedSessionData = {
          encryptedToken,
          encryptedKeypair,
          validUntilTimestamp: expiryTimestamp,
        };

        // Save the encrypted session data in the SESSION_OBJECT_STORE with sessionToken as key
        await setItemToIndexedDB(
          SESSION_OBJECT_STORE,
          encryptedSessionData,
          sessionTokenString,
        );

        // Save the wallet public key to sessionToken mapping in WALLET_PUBKEY_TO_SESSION_STORE
        await setItemToIndexedDB(
          WALLET_PUBKEY_TO_SESSION_STORE,
          sessionTokenString,
          wallet.publicKey.toBase58(),
        );

        // Save the encryption key in the ENCRYPTION_KEY_OBJECT_STORE with wallet public key as key
        await setItemToIndexedDB(
          ENCRYPTION_KEY_OBJECT_STORE,
          {
            userPreferences: encryptionKey,
            validUntilTimestamp: expiryTimestamp,
          },
          wallet.publicKey.toBase58(),
        );

        sessionTokenRef.current = sessionTokenString;
        triggerRerender();

        if (!sessionTokenRef.current) {
          console.error("Session token not generated.");
        }

        if (sessionCreatedCallback) {
          sessionCreatedCallback({
            sessionToken: sessionTokenRef.current,
            publicKey: sessionSignerPublicKey.toBase58(),
          });
        }

        return {
          ownerPublicKey: wallet.publicKey,
          isLoading: false,
          error: null,
          sessionToken: sessionTokenRef.current,
          publicKey: sessionSignerPublicKey,
          signMessage,
          signTransaction,
          signAllTransactions,
          signAndSendTransaction,
          sendTransaction,
        };
      } catch (error: any) {
        console.error("Error creating session:", error);
        setError(error);
        return {
          publicKey: wallet.publicKey,
          ownerPublicKey: null,
          isLoading: false,
          error: error.message,
          sessionToken: null,
          signTransaction: null,
          signAllTransactions: null,
          signMessage: null,
          sendTransaction: null,
          signAndSendTransaction: null,
          getSessionToken: null,
          createSession: null,
          revokeSession: null,
        };
      }
    });
  };

  const resetSessionData = () => {
    keypairRef.current = null;
    sessionTokenRef.current = null;
    triggerRerender();
  };

  const revokeSession = async () => {
    return withLoading(async () => {
      try {
        if (!sessionTokenRef.current || !keypairRef.current) {
          return;
        }
        const sessionTokenPublicKey = keypairRef.current.publicKey;

        const instructionMethodBuilder = sdk.program.methods
          .revokeSession()
          .accounts({
            sessionToken: sessionTokenRef.current,
            authority: wallet.publicKey,
          });
        const txId = await instructionMethodBuilder.rpc();

        // Transfer all the lamports from the session keypair wallet to the owner wallet
        const sessionSignerSolanaBalance = await connection.getBalance(
          sessionTokenPublicKey,
        );
        if (sessionSignerSolanaBalance > 0) {
          const tx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: sessionTokenPublicKey,
              toPubkey: wallet.publicKey,
              lamports: sessionSignerSolanaBalance,
            }),
          );
          tx.feePayer = sessionTokenPublicKey;
          tx.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          const estimatedFee = await tx.getEstimatedFee(connection);

          if (estimatedFee && sessionSignerSolanaBalance > estimatedFee) {
            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: sessionTokenPublicKey,
                toPubkey: wallet.publicKey,
                lamports: sessionSignerSolanaBalance - estimatedFee,
              }),
            );
            await sendTransaction(transaction);
          }
        }

        // Delete session data for the wallet
        const walletPublicKey = wallet.publicKey.toBase58();
        await deleteItemFromIndexedDB(
          SESSION_OBJECT_STORE,
          sessionTokenRef.current,
        );
        await deleteItemFromIndexedDB(
          ENCRYPTION_KEY_OBJECT_STORE,
          walletPublicKey,
        );
        await deleteItemFromIndexedDB(
          WALLET_PUBKEY_TO_SESSION_STORE,
          walletPublicKey,
        );

        resetSessionData();
        return txId;
      } catch (error: any) {
        console.error("Error revoking session:", error);
        setError(error);
        return null;
      }
    });
  };

  if (!wallet) {
    return {
      publicKey: null,
      ownerPublicKey: null,
      isLoading: false,
      sessionToken: null,
      signTransaction: undefined,
      signAllTransactions: undefined,
      signMessage: undefined,
      sendTransaction: undefined,
      signAndSendTransaction: undefined,
      getSessionToken: async () => null,
      createSession: async () => undefined,
      revokeSession: async () => null,
      error,
    };
  }

  return {
    publicKey:
      sessionTokenRef.current && keypairRef.current
        ? keypairRef.current.publicKey
        : null,
    ownerPublicKey: wallet.publicKey,
    isLoading,
    error,
    sessionToken: sessionTokenRef.current,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    signAndSendTransaction,
    getSessionToken,
    createSession,
    revokeSession,
  };
}
