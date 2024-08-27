/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sniff.json`.
 */
export type Sniff = {
  address: "7RG7EnGnLoPqRmjcNQijaAZEuUNn2qFJUyEJBSTkTUfv";
  metadata: {
    name: "sniff";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "register";
      discriminator: [211, 124, 67, 15, 211, 194, 178, 240];
      accounts: [
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "userAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 45, 97, 99, 99, 111, 117, 110, 116];
              },
              {
                kind: "account";
                path: "authority";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "diffiePubkey";
          type: "string";
        },
      ];
    },
    {
      name: "sendMessage";
      discriminator: [57, 40, 34, 178, 189, 10, 65, 26];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "message";
          writable: true;
          signer: true;
        },
        {
          name: "userAccount";
          writable: true;
        },
        {
          name: "sessionToken";
          optional: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "body";
          type: "string";
        },
        {
          name: "to";
          type: "pubkey";
        },
        {
          name: "salt";
          type: "string";
        },
        {
          name: "iv";
          type: "string";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "message";
      discriminator: [110, 151, 23, 110, 198, 6, 125, 181];
    },
    {
      name: "sessionToken";
      discriminator: [233, 4, 115, 14, 46, 21, 1, 15];
    },
    {
      name: "userAccount";
      discriminator: [211, 33, 136, 16, 186, 110, 242, 127];
    },
  ];
  events: [
    {
      name: "newMessageEvent";
      discriminator: [127, 234, 5, 151, 15, 124, 28, 143];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "invalidInstruction";
      msg: "Invalid instruction";
    },
    {
      code: 6001;
      name: "invalidBody";
      msg: "The body of your email is too long. The max is 512 chars";
    },
    {
      code: 6002;
      name: "invalidSubject";
      msg: "The subject of your email is too long. The max is 40 chars";
    },
    {
      code: 6003;
      name: "invalidSalt";
      msg: "The salt should be exactly 16 chars";
    },
    {
      code: 6004;
      name: "invalidIv";
      msg: "The IV should be exactly 32 chars";
    },
    {
      code: 6005;
      name: "invalidDiffie";
      msg: "The diffie publickey should be exactly 64 chars";
    },
    {
      code: 6006;
      name: "unauthorizedSigner";
      msg: "Wrong signer";
    },
  ];
  types: [
    {
      name: "message";
      type: {
        kind: "struct";
        fields: [
          {
            name: "from";
            type: "pubkey";
          },
          {
            name: "to";
            type: "pubkey";
          },
          {
            name: "id";
            type: "string";
          },
          {
            name: "subject";
            type: "string";
          },
          {
            name: "body";
            type: "string";
          },
          {
            name: "createdAt";
            type: "u32";
          },
          {
            name: "iv";
            type: "string";
          },
          {
            name: "salt";
            type: "string";
          },
        ];
      };
    },
    {
      name: "newMessageEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "from";
            type: "pubkey";
          },
          {
            name: "to";
            type: "pubkey";
          },
          {
            name: "id";
            type: "string";
          },
        ];
      };
    },
    {
      name: "sessionToken";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "targetProgram";
            type: "pubkey";
          },
          {
            name: "sessionSigner";
            type: "pubkey";
          },
          {
            name: "validUntil";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "userAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "diffiePubkey";
            type: "string";
          },
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
        ];
      };
    },
  ];
};
