/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting_program.json`.
 */
export type VotingProgram = {
  "address": "DWBmTLQ8gcWeJGQJLunUWTKbAjrBiTeunDKyZ3hCCbFQ",
  "metadata": {
    "name": "votingProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveCandidate",
      "discriminator": [
        11,
        191,
        107,
        29,
        208,
        81,
        52,
        40
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  110,
                  100,
                  105,
                  100,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "candidate.wallet",
                "account": "candidate"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "adminMessage",
          "type": "string"
        }
      ]
    },
    {
      "name": "approveVoter",
      "discriminator": [
        38,
        88,
        225,
        240,
        120,
        4,
        249,
        62
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "voter.wallet",
                "account": "voter"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "adminMessage",
          "type": "string"
        }
      ]
    },
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "voterWallet"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  110,
                  100,
                  105,
                  100,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "candidate.wallet",
                "account": "candidate"
              }
            ]
          }
        },
        {
          "name": "voterWallet",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeElection",
      "discriminator": [
        62,
        216,
        57,
        149,
        90,
        21,
        40,
        127
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initializeElection",
      "discriminator": [
        59,
        166,
        191,
        126,
        195,
        0,
        153,
        168
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "registerCandidate",
      "discriminator": [
        91,
        136,
        96,
        222,
        242,
        4,
        160,
        182
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  110,
                  100,
                  105,
                  100,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "candidateWallet"
              }
            ]
          }
        },
        {
          "name": "candidateWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "about",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerVoter",
      "discriminator": [
        229,
        124,
        185,
        99,
        118,
        51,
        226,
        6
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "voterWallet"
              }
            ]
          }
        },
        {
          "name": "voterWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "rejectCandidate",
      "discriminator": [
        77,
        44,
        152,
        31,
        118,
        79,
        38,
        139
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  110,
                  100,
                  105,
                  100,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "candidate.wallet",
                "account": "candidate"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "adminMessage",
          "type": "string"
        }
      ]
    },
    {
      "name": "rejectVoter",
      "discriminator": [
        93,
        31,
        95,
        247,
        32,
        157,
        212,
        115
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "voter.wallet",
                "account": "voter"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "adminMessage",
          "type": "string"
        }
      ]
    },
    {
      "name": "transferAdmin",
      "discriminator": [
        42,
        242,
        66,
        106,
        228,
        10,
        111,
        156
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateCandidateProfile",
      "discriminator": [
        28,
        138,
        36,
        230,
        246,
        185,
        30,
        45
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  110,
                  100,
                  105,
                  100,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "candidateWallet"
              }
            ]
          }
        },
        {
          "name": "candidateWallet",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "about",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateElectionPeriod",
      "discriminator": [
        214,
        10,
        121,
        28,
        217,
        131,
        50,
        89
      ],
      "accounts": [
        {
          "name": "election",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "election"
          ]
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateVoterProfile",
      "discriminator": [
        139,
        113,
        229,
        250,
        90,
        74,
        70,
        124
      ],
      "accounts": [
        {
          "name": "election"
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "election"
              },
              {
                "kind": "account",
                "path": "voterWallet"
              }
            ]
          }
        },
        {
          "name": "voterWallet",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "candidate",
      "discriminator": [
        86,
        69,
        250,
        96,
        193,
        10,
        222,
        123
      ]
    },
    {
      "name": "election",
      "discriminator": [
        68,
        191,
        164,
        85,
        35,
        105,
        152,
        202
      ]
    },
    {
      "name": "voter",
      "discriminator": [
        241,
        93,
        35,
        191,
        254,
        147,
        17,
        202
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Only the election admin can perform this action"
    },
    {
      "code": 6001,
      "name": "electionNotActive",
      "msg": "The election is not active"
    },
    {
      "code": 6002,
      "name": "electionNotStarted",
      "msg": "The election has not started yet"
    },
    {
      "code": 6003,
      "name": "electionEnded",
      "msg": "The election has already ended"
    },
    {
      "code": 6004,
      "name": "invalidElectionTime",
      "msg": "Election start time must be before end time"
    },
    {
      "code": 6005,
      "name": "candidateNotApproved",
      "msg": "Candidate is not approved"
    },
    {
      "code": 6006,
      "name": "voterNotApproved",
      "msg": "Voter is not approved"
    },
    {
      "code": 6007,
      "name": "alreadyVoted",
      "msg": "Voter has already voted"
    },
    {
      "code": 6008,
      "name": "invalidCandidate",
      "msg": "Candidate wallet does not match the registered wallet"
    },
    {
      "code": 6009,
      "name": "invalidVoter",
      "msg": "Voter wallet does not match the registered wallet"
    },
    {
      "code": 6010,
      "name": "invalidCandidateStatus",
      "msg": "Invalid candidate status"
    },
    {
      "code": 6011,
      "name": "invalidVoterStatus",
      "msg": "Invalid voter status"
    },
    {
      "code": 6012,
      "name": "stringTooLong",
      "msg": "String exceeds the maximum allowed length"
    },
    {
      "code": 6013,
      "name": "counterOverflow",
      "msg": "Vote count overflow"
    },
    {
      "code": 6014,
      "name": "invalidAdmin",
      "msg": "New admin cannot be the default address"
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "Candidate wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Display name"
            ],
            "type": "string"
          },
          {
            "name": "about",
            "docs": [
              "Candidate manifesto / about section"
            ],
            "type": "string"
          },
          {
            "name": "voteCount",
            "docs": [
              "Number of votes received"
            ],
            "type": "u64"
          },
          {
            "name": "status",
            "docs": [
              "Admin approval status"
            ],
            "type": {
              "defined": {
                "name": "status"
              }
            }
          },
          {
            "name": "adminMessage",
            "docs": [
              "Message from admin (approval or rejection reason)"
            ],
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "docs": [
              "Avatar image URL (Cloudinary/IPFS)"
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "election",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalCandidates",
            "type": "u64"
          },
          {
            "name": "totalVoters",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "status",
      "docs": [
        "Approval status controlled by the admin"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          }
        ]
      }
    },
    {
      "name": "voter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "Voter wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Display name"
            ],
            "type": "string"
          },
          {
            "name": "bio",
            "docs": [
              "Short bio"
            ],
            "type": "string"
          },
          {
            "name": "hasVoted",
            "docs": [
              "Prevents double voting"
            ],
            "type": "bool"
          },
          {
            "name": "status",
            "docs": [
              "Admin approval status"
            ],
            "type": {
              "defined": {
                "name": "status"
              }
            }
          },
          {
            "name": "adminMessage",
            "docs": [
              "Message from admin"
            ],
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "docs": [
              "Avatar image URL"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "candidateSeed",
      "type": "bytes",
      "value": "[99, 97, 110, 100, 105, 100, 97, 116, 101]"
    },
    {
      "name": "electionSeed",
      "type": "bytes",
      "value": "[101, 108, 101, 99, 116, 105, 111, 110]"
    },
    {
      "name": "voterSeed",
      "type": "bytes",
      "value": "[118, 111, 116, 101, 114]"
    }
  ]
};
