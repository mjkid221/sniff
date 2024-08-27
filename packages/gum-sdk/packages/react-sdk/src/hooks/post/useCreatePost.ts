import { SDK } from "@magicblock-labs/gum-sdk";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;

const useCreatePost = (sdk: SDK) => {
  const [postPDA, setPostPDA] = useState<PublicKey | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<Error | null>(null);

  const create = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      setIsCreatingPost(true);
      setCreatePostError(null);

      try {
        const ixMethodBuilder = await createPostIxMethodBuilder(metadataUri, profileAccount, owner, payer);
        return await ixMethodBuilder?.rpc();
      } catch (err: any) {
        setCreatePostError(err);
      } finally {
        setIsCreatingPost(false);
      }
    },
    [sdk]
  );

  const createWithSession = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      sendTransaction: sendTransactionFn,
      payer: PublicKey = sessionPublicKey,
      connection?: Connection,
      options?: SendTransactionOptions
    ) => {
      setIsCreatingPost(true);
      setCreatePostError(null);

      try {
        const ixMethodBuilder = await createPostWithSessionIxMethodBuilder(metadataUri, profileAccount, sessionPublicKey, sessionAccount, payer);
        const tx = await ixMethodBuilder?.transaction();
        if (tx) {
          return await sendTransaction(tx, connection, options);
        }
      } catch (err: any) {
        setCreatePostError(err);
      } finally {
        setIsCreatingPost(false);
      }
    },
    [sdk]
  );

  const createPostIxMethodBuilder = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      owner: PublicKey,
      payer: PublicKey = owner,
    ) => {
      setCreatePostError(null);

      try {
        const data = await sdk.post.create(metadataUri, profileAccount, owner, payer);
        setPostPDA(data.postPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreatePostError(err);
        return null;
      }
    },
    [sdk]
  );

  const createPostWithSessionIxMethodBuilder = useCallback(
    async (
      metadataUri: string,
      profileAccount: PublicKey,
      sessionPublicKey: PublicKey,
      sessionAccount: PublicKey,
      payer: PublicKey = sessionPublicKey
    ) => {
      setCreatePostError(null);

      try {
        const data = await sdk.post.createWithSession(metadataUri, profileAccount, sessionPublicKey, sessionAccount, payer);
        setPostPDA(data.postPDA);
        return data.instructionMethodBuilder;
      } catch (err: any) {
        setCreatePostError(err);
        return null;
      }
    },
    [sdk]
  );

  return {
    create,
    createWithSession,
    createPostIxMethodBuilder,
    createPostWithSessionIxMethodBuilder,
    postPDA,
    isCreatingPost,
    createPostError
  };
};

export { useCreatePost };