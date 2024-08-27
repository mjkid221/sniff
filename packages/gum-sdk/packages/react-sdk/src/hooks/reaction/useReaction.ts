import { SDK } from "@magicblock-labs/gum-sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

const useReaction = (sdk: SDK, ) => {
  const [reactionPDA, setReactionPDA] = useState<PublicKey | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [createReactionError, setCreateReactionError] = useState(null);

  const createReaction = useCallback(
    async (
      reaction: string,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await createReactionIxMethodBuilder(reaction, fromProfile, toPostAccount, owner, payer);

        if (ixMethodBuilder) {
          return await ixMethodBuilder.rpc();
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );

  const createReactionWithSession = useCallback(
    async (
      reaction: string,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      payer: PublicKey = sessionPublicKey,
      sendTransactionFn: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsReacting(true);
      setCreateReactionError(null);

      try {
        const ixMethodBuilder = await createReactionWithSessionIxMethodBuilder(reaction, fromProfile, toPostAccount, sessionPublicKey, sessionAccount, payer);

        if (ixMethodBuilder) {
          const tx = await ixMethodBuilder.transaction();
          if (tx) {
            return await sendTransactionFn(tx, connection, options);
          }
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );

  const createReactionIxMethodBuilder = useCallback(
    async (
      reaction: string,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      try {
        const data = await sdk.reaction.create(fromProfile, toPostAccount, reaction, owner, payer);
        setReactionPDA(data.reactionPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreateReactionError(err);
        return null;
      }
    },
    [sdk]
  );

  const createReactionWithSessionIxMethodBuilder = useCallback(
    async (
      reaction: string,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      sessionPublicKey: PublicKey,
      sessionTokenAccount: PublicKey,
      payer: PublicKey = sessionPublicKey,
    ) => {
      try {
        const data = await sdk.reaction.createWithSession(fromProfile, toPostAccount, reaction, sessionPublicKey, sessionTokenAccount, payer);
        setReactionPDA(data.reactionPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreateReactionError(err);
        return null;
      }
    },
    [sdk]
  );

  const deleteReaction = useCallback(
    async (
      reactionAccount: PublicKey,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      owner: PublicKey,
      refundReceiver: PublicKey = owner,
    ) => {
      setIsReacting(true);

      try {
        const ixMethodBuilder = deleteReactionIxMethodBuilder(reactionAccount, fromProfile, toPostAccount, owner, refundReceiver);

        if (ixMethodBuilder) {
          return await ixMethodBuilder.rpc();
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );

  const deleteReactionWithSession = useCallback(
    async (
      reactionAccount: PublicKey,
      fromProfile: PublicKey,
      toPostAccount: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      refundReceiver: PublicKey = sessionPublicKey,
      sendTransaction: sendTransactionFn,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsReacting(true);

      try {
        const ixMethodBuilder = deleteReactionWithSessionIxMethodBuilder(reactionAccount, fromProfile, toPostAccount, sessionPublicKey, sessionAccount, refundReceiver);

        if (ixMethodBuilder) {
          const tx = await ixMethodBuilder.transaction();
          if (tx) {
            return await sendTransaction(tx, connection, options);
          }
        } else {
          throw new Error('ixMethodBuilder is undefined');
        }
      } catch (err: any) {
        setCreateReactionError(err);
      } finally {
        setIsReacting(false);
      }
    },
    [sdk]
  );

  const deleteReactionIxMethodBuilder = useCallback((
    reactionAccount: PublicKey,
    fromProfile: PublicKey,
    toPostAccount: PublicKey,
    owner: PublicKey,
    refundReceiver: PublicKey = owner,
  ) => {
    setCreateReactionError(null);

    try {
      const data = sdk.reaction.delete(reactionAccount, toPostAccount, fromProfile, owner, refundReceiver);
      return data;
    } catch (err: any) {
      setCreateReactionError(err);
      return null;
    }
  }, [sdk]);

  const deleteReactionWithSessionIxMethodBuilder = useCallback((
    reactionAccount: PublicKey,
    fromProfile: PublicKey,
    toPostAccount: PublicKey,
    sessionPublicKey: PublicKey,
    sessionAccount: PublicKey,
    refundReceiver: PublicKey = sessionPublicKey,
  ) => {
    setCreateReactionError(null);

    try {
      const data = sdk.reaction.deleteWithSession(reactionAccount, toPostAccount, fromProfile,  sessionPublicKey, sessionAccount, refundReceiver);
      return data;
    } catch (err: any) {
      setCreateReactionError(err);
      return null;
    }
  }, [sdk]);


  return {
    createReaction,
    createReactionWithSession,
    createReactionIxMethodBuilder,
    createReactionWithSessionIxMethodBuilder,
    deleteReaction,
    deleteReactionWithSession,
    deleteReactionIxMethodBuilder,
    deleteReactionWithSessionIxMethodBuilder,
    reactionPDA,
    isReacting,
    createReactionError
  };
};

export { useReaction };
