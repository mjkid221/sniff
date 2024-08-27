export type GplNameservice = {
  "version": "0.1.0",
  "name": "gpl_nameservice",
  "instructions": [
    {
      "name": "createTld",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tld",
          "type": "string"
        }
      ]
    },
    {
      "name": "createNameRecord",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "domain",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "transferNameRecord",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false,
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nameRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "domain",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameTooLong",
      "msg": "Name is too long."
    },
    {
      "code": 6001,
      "name": "TldTooLong",
      "msg": "TLD is too long."
    },
    {
      "code": 6002,
      "name": "NameTaken",
      "msg": "Name is already taken."
    },
    {
      "code": 6003,
      "name": "InvalidNameService",
      "msg": "The PDA is not issued by a supported name service program"
    },
    {
      "code": 6004,
      "name": "InvalidOwner"
    },
    {
      "code": 6005,
      "name": "InvalidDataLength"
    },
    {
      "code": 6006,
      "name": "InvalidAuthority"
    },
    {
      "code": 6007,
      "name": "InvalidNameRecord"
    }
  ]
};

export const IDL: GplNameservice = {
  "version": "0.1.0",
  "name": "gpl_nameservice",
  "instructions": [
    {
      "name": "createTld",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tld",
          "type": "string"
        }
      ]
    },
    {
      "name": "createNameRecord",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "domain",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "transferNameRecord",
      "accounts": [
        {
          "name": "nameRecord",
          "isMut": true,
          "isSigner": false,
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nameRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "domain",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameTooLong",
      "msg": "Name is too long."
    },
    {
      "code": 6001,
      "name": "TldTooLong",
      "msg": "TLD is too long."
    },
    {
      "code": 6002,
      "name": "NameTaken",
      "msg": "Name is already taken."
    },
    {
      "code": 6003,
      "name": "InvalidNameService",
      "msg": "The PDA is not issued by a supported name service program"
    },
    {
      "code": 6004,
      "name": "InvalidOwner"
    },
    {
      "code": 6005,
      "name": "InvalidDataLength"
    },
    {
      "code": 6006,
      "name": "InvalidAuthority"
    },
    {
      "code": 6007,
      "name": "InvalidNameRecord"
    }
  ]
};
