import * as anchor from "@project-serum/anchor";

export const OLD_GPLCORE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm",
  ),
  devnet: new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm",
  ),
  localnet: new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm",
  ),
};

export const GPLCORE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6",
  ),
  devnet: new anchor.web3.PublicKey(
    "6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6",
  ),
  localnet: new anchor.web3.PublicKey(
    "6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6",
  ),
};

export const GPLSESSION_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "4mYFD9UAPw9E8qpL4HgDHde1hRCrjEs42X3eFUJufcEC",
  ),
  devnet: new anchor.web3.PublicKey(
    "4mYFD9UAPw9E8qpL4HgDHde1hRCrjEs42X3eFUJufcEC",
  ),
  localnet: new anchor.web3.PublicKey(
    "4mYFD9UAPw9E8qpL4HgDHde1hRCrjEs42X3eFUJufcEC",
  ),
};

export const GPL_NAMESERVICE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "5kWEYrdyryq3jGP5sUcKwTySzxr3dHzWFBVA3vkt6Nj5",
  ),
  devnet: new anchor.web3.PublicKey(
    "5kWEYrdyryq3jGP5sUcKwTySzxr3dHzWFBVA3vkt6Nj5",
  ),
  localnet: new anchor.web3.PublicKey(
    "5kWEYrdyryq3jGP5sUcKwTySzxr3dHzWFBVA3vkt6Nj5",
  ),
};

export const GRAPHQL_ENDPOINTS_OLD = {
  devnet: "https://gum-indexer-devnet-lafkve5tyq-uc.a.run.app/v1/graphql",
  "mainnet-beta":
    "https://gum-indexer-mainnet-lafkve5tyq-uc.a.run.app/v1/graphql",
};

export const GRAPHQL_ENDPOINTS = {
  devnet:
    "https://gum-indexer-smartprofile-devnet-lafkve5tyq-uc.a.run.app/v1/graphql",
  "mainnet-beta":
    "https://gum-indexer-smartprofile-mainnet-lafkve5tyq-uc.a.run.app/v1/graphql",
};

export const GATEWAY_SERVICE_URL =
  "https://issue-gateway-credentials-lafkve5tyq-uc.a.run.app";

export const GUM_TLD_ACCOUNT = new anchor.web3.PublicKey(
  "DgpTGt1CJsJRGzfzvcgJ93panPf2cRZLNkakJ4wpTwta",
);
