import type { Program } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import type { lib } from "crypto-js";
import * as anchor from "@coral-xyz/anchor";
import { SessionTokenManager } from "@magicblock-labs/gum-sdk";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { enc, mode } from "crypto-js";
import AES from "crypto-js/aes";
import { parseUnits } from "ethers";
import sodium from "libsodium-wrappers";
import nacl from "tweetnacl";

// import { decodeUTF8, encodeBase64 } from "tweetnacl-util";

import type { Sniff } from "../../target/types/sniff";
import {
  enforceNetworkProtection,
  getNamedAccounts,
  setupSignersInitialBalance,
  useGetAccountBalance,
} from "../../utils";

chai.use(chaiAsPromised);

interface DiffieKeypairs {
  secretKey: string;
  publicKey: string;
  secretKeyUint8Array: Uint8Array;
  publicKeyUint8Array: Uint8Array;
}
const convertEd25519ToCurve25519 = (keypair: Keypair): DiffieKeypairs => {
  const ed25519PrivateKey = keypair.secretKey;

  const curve25519PrivateKey: Uint8Array =
    sodium.crypto_sign_ed25519_sk_to_curve25519(ed25519PrivateKey);

  const curve25519PublicKey: Uint8Array =
    sodium.crypto_sign_ed25519_pk_to_curve25519(keypair.publicKey.toBytes());

  return {
    secretKey: bs58.encode(curve25519PrivateKey),
    publicKey: bs58.encode(curve25519PublicKey),
    secretKeyUint8Array: curve25519PrivateKey,
    publicKeyUint8Array: curve25519PublicKey,
  };
};

const useCreateSignerForSession = (connection: Connection) => {
  const createSignerForSession = async (
    forUser: Keypair,
    prefundAmount?: number,
  ) => {
    const newKeypair = Keypair.generate();
    if (!prefundAmount) {
      return { sessionSigner: newKeypair };
    }
    // transfer some SOL to the new account from forUser via new tx
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(forUser.publicKey),
        toPubkey: newKeypair.publicKey,
        lamports: parseUnits(prefundAmount.toString(), 9),
      }),
    );
    transaction.feePayer = forUser.publicKey;
    await sendAndConfirmTransaction(connection, transaction, [forUser], {
      commitment: "confirmed",
    });

    return { sessionSigner: newKeypair };
  };

  return { createSignerForSession };
};

describe("Sniff - Send Message", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Sniff as Program<Sniff>;
  const provider = anchor.getProvider();
  const { alice, bob } = getNamedAccounts(program);
  const sessionManager = new SessionTokenManager(
    // @ts-expect-error -- wallet is injected
    provider.wallet,
    provider.connection,
    "devnet",
  );
  const { getBalance } = useGetAccountBalance(provider.connection);
  const { createSignerForSession } = useCreateSignerForSession(
    provider.connection,
  );
  /* generating diffie helmann keys */
  // const aliceKeypair = ellipticEDDSA.genKeyPair();
  // const bobKeypair = ellipticEDDSA.genKeyPair();
  // const aliceDiffiePublic = aliceKeypair.getPublic().encode("hex", true);
  // const bobDiffiePublic = bobKeypair.getPublic().encode("hex", true);
  // const sharedSecret = aliceKeypair
  //   .derive(bobKeypair.getPublic())
  //   .toString("hex");

  // const sharedSecret2 = bobKeypair
  //   .derive(aliceKeypair.getPublic())
  //   .toString("hex");
  let aliceKeypair: DiffieKeypairs;
  let bobKeypair: DiffieKeypairs;
  let aliceDiffiePublic: string;
  let bobDiffiePublic: string;
  let sharedSecret: string;

  before("TEST SETUP", async () => {
    // Check the tests are running on localhost
    enforceNetworkProtection(program);
    // Setup the initial balance (SOL) for the test accounts
    await setupSignersInitialBalance(program);
    // Generate diffie helmann keys for test users
    aliceKeypair = convertEd25519ToCurve25519(alice);
    bobKeypair = convertEd25519ToCurve25519(bob);
    aliceDiffiePublic = Buffer.from(aliceKeypair.publicKeyUint8Array).toString(
      "hex",
    );
    bobDiffiePublic = Buffer.from(bobKeypair.publicKeyUint8Array).toString(
      "hex",
    );
    sharedSecret = bs58.encode(
      nacl.scalarMult(
        aliceKeypair.secretKeyUint8Array,
        bobKeypair.publicKeyUint8Array,
      ),
    );
  });

  it.only("should test", async () => {
    console.log("1: ", (await getBalance(alice.publicKey)).balanceUI);
    await program.methods
      .register(aliceDiffiePublic)
      .accounts({
        authority: alice.publicKey,
      })
      .signers([alice])
      .rpcAndKeys();

    console.log("2: ", (await getBalance(alice.publicKey)).balanceUI);

    const { sessionSigner } = await createSignerForSession(alice);
    console.log("alice key: ", alice.publicKey.toBase58());
    console.log("session signer key: ", sessionSigner.publicKey.toBase58());
    console.log("3: ", (await getBalance(alice.publicKey)).balanceUI);
    console.log(
      "session signer: ",
      (await getBalance(sessionSigner.publicKey)).balanceUI,
    );
    const {
      pubkeys: { sessionToken },
    } = await sessionManager.program.methods
      .createSession(true, null)
      .accounts({
        sessionSigner: sessionSigner.publicKey,
        authority: alice.publicKey,
        targetProgram: program.programId,
      })
      .signers([alice, sessionSigner])
      .rpcAndKeys();

    console.log(
      "after creating session alice: ",
      (await getBalance(alice.publicKey)).balanceUI,
    );
    console.log(
      "after creating session sessionSigner: ",
      (await getBalance(sessionSigner.publicKey)).balanceUI,
    );
    const cipher = AES.encrypt("sending test message", sharedSecret, {
      mode: mode.CTR,
    });

    const testBody = cipher.ciphertext.toString();
    const salt = cipher.salt.toString();
    const iv = cipher.iv.toString();

    const newMessageKeypair = Keypair.generate();
    const newMessage = newMessageKeypair.publicKey;
    await program.methods
      .sendMessage(testBody, bob.publicKey, salt, iv)
      .accounts({
        payer: sessionSigner.publicKey,
        message: newMessage,
        authority: alice.publicKey,
        sessionToken: sessionToken!,
        // sessionToken: null,
      })
      .signers([alice, sessionSigner, newMessageKeypair])
      .rpc();

    console.log(
      "after sending message alice: ",
      (await getBalance(alice.publicKey)).balanceUI,
    );
    console.log(
      "after sending message sessionSigner: ",
      (await getBalance(sessionSigner.publicKey)).balanceUI,
    );
  });

  it("should be able to register users", async () => {
    const aliceRegisterTx = program.methods
      .register(aliceDiffiePublic)
      .accounts({
        authority: alice.publicKey,
      })
      .signers([alice]);

    const bobRegisterTx = program.methods
      .register(bobDiffiePublic)
      .accounts({
        authority: bob.publicKey,
      })
      .signers([bob]);

    const { userAccount: aliceUserAccount } = await aliceRegisterTx.pubkeys();
    const { userAccount: bobUserAccount } = await bobRegisterTx.pubkeys();
    await aliceRegisterTx.rpc();
    await bobRegisterTx.rpc();

    expect(
      (await program.account.userAccount.fetch(aliceUserAccount!)).diffiePubkey,
    ).to.equal(aliceDiffiePublic);
    expect(
      (await program.account.userAccount.fetch(bobUserAccount!)).diffiePubkey,
    ).to.equal(bobDiffiePublic);
  });

  it("Sends a message!", async () => {
    const cipher = AES.encrypt("sending test message", sharedSecret, {
      mode: mode.CTR,
    });

    const testBody = cipher.ciphertext.toString();
    const salt = cipher.salt.toString();
    const iv = cipher.iv.toString();

    const newMessageKeypair = Keypair.generate();
    const newMessage = newMessageKeypair.publicKey;
    await program.methods
      .sendMessage(testBody, bob.publicKey, salt, iv)
      .accounts({
        message: newMessage,
        authority: alice.publicKey,
        sessionToken: null,
      })
      .signers([alice, newMessageKeypair])
      .rpc();

    const message = await program.account.message.fetch(newMessage);
    console.log("message", message);

    const plaintext = AES.decrypt(
      {
        ciphertext: enc.Hex.parse(message.body),
        iv: enc.Hex.parse(message.iv),
        salt: enc.Hex.parse(message.salt),
      } as lib.CipherParams,
      sharedSecret,
      { mode: mode.CTR },
    );

    console.log("plaintext: ", plaintext.toString(enc.Utf8));
  });
});
