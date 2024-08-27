import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Cluster } from "@solana/web3.js";
import { GraphQLClient } from "graphql-request";

import { Badge } from "./badge";
import { Connection, GraphQLConnection } from "./connection";
import {
  GATEWAY_SERVICE_URL,
  GPL_NAMESERVICE_PROGRAMS,
  GPLCORE_PROGRAMS,
  GPLSESSION_PROGRAMS,
  GRAPHQL_ENDPOINTS,
  GRAPHQL_ENDPOINTS_OLD,
  GUM_TLD_ACCOUNT,
  OLD_GPLCORE_PROGRAMS,
} from "./constants";
import { GplCore } from "./idl/gpl_core";
import gpl_core_idl from "./idl/gpl_core.json";
import { GplNameservice } from "./idl/gpl_nameservice";
import gpl_nameservice from "./idl/gpl_nameservice.json";
import { GumNameService } from "./nameservice";
import { GraphQLFeed, GraphQLPost, Post } from "./post";
import { PostMetadata } from "./postMetadata";
import { GumDecodedProfile, Profile } from "./profile";
import { GraphQLReaction, Reaction } from "./reaction";
import { SessionTokenManager } from "./sessionTokenManager";

export {
  GPLCORE_PROGRAMS,
  GRAPHQL_ENDPOINTS,
  OLD_GPLCORE_PROGRAMS,
  GRAPHQL_ENDPOINTS_OLD,
  GPL_NAMESERVICE_PROGRAMS,
  GPLSESSION_PROGRAMS,
  GATEWAY_SERVICE_URL,
  GUM_TLD_ACCOUNT,
  Connection,
  GraphQLConnection,
  Post,
  GraphQLPost,
  GraphQLFeed,
  Profile,
  GumDecodedProfile,
  Reaction,
  GraphQLReaction,
  Badge,
  SessionTokenManager,
  PostMetadata,
  GumNameService,
};

export class SDK {
  readonly program: anchor.Program<GplCore>;
  readonly nameserviceProgram: anchor.Program<GplNameservice>;
  readonly provider: anchor.AnchorProvider;
  readonly rpcConnection: anchor.web3.Connection;
  readonly cluster: Cluster | "localnet";
  readonly gqlClient?: GraphQLClient;

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    opts: anchor.web3.ConfirmOptions,
    cluster: Cluster | "localnet",
    gqlClient?: GraphQLClient,
  ) {
    this.cluster = cluster;
    this.provider = new anchor.AnchorProvider(connection, wallet, opts);
    this.program = new anchor.Program(
      gpl_core_idl as anchor.Idl,
      GPLCORE_PROGRAMS[this.cluster] as anchor.web3.PublicKey,
      this.provider,
    ) as anchor.Program<GplCore>;
    this.nameserviceProgram = new anchor.Program(
      gpl_nameservice as anchor.Idl,
      GPL_NAMESERVICE_PROGRAMS[cluster] as anchor.web3.PublicKey,
      this.provider,
    ) as anchor.Program<GplNameservice>;
    this.rpcConnection = connection;
    this.gqlClient = gqlClient;
  }

  public profile = new Profile(this);
  public connection = new Connection(this);
  public post = new Post(this);
  public reaction = new Reaction(this);
  public badge = new Badge(this);
  public nameservice = new GumNameService(this);
}
