/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solpay_smartcontract.json`.
 */
export type SolpaySmartcontract = {
  "address": "EVBgMcsQdMqHrm2KMscsPUKUsFAcbpJUkAjBSWHGwL8A",
  "metadata": {
    "name": "solpaySmartcontract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeCancelSubscription",
      "discriminator": [
        154,
        180,
        189,
        36,
        164,
        2,
        141,
        212
      ],
      "accounts": [
        {
          "name": "userSubscription",
          "writable": true
        },
        {
          "name": "subscriptionPlan"
        },
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeMerchant",
      "discriminator": [
        7,
        90,
        74,
        38,
        99,
        111,
        142,
        77
      ],
      "accounts": [
        {
          "name": "merchantRegistration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
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
          "name": "merchantName",
          "type": "string"
        },
        {
          "name": "merchantWeburl",
          "type": "string"
        },
        {
          "name": "supportedTokens",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "initializePaymentTransaction",
      "discriminator": [
        178,
        80,
        74,
        193,
        54,
        252,
        121,
        205
      ],
      "accounts": [
        {
          "name": "paymentTransaction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                {
                  "kind": "arg",
                  "path": "txSignatureHash"
                }
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "txSignature"
              }
            ]
          }
        },
        {
          "name": "merchantRegistration"
        },
        {
          "name": "payer",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
          {
            "name": "txSignatureHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
      ],
      "args": [
        {
          "name": "txSignature",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "status",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeSubscriptionPlan",
      "discriminator": [
        222,
        51,
        240,
        12,
        204,
        39,
        119,
        105
      ],
      "accounts": [
        {
          "name": "subscriptionPlan",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "planName"
              },
              {
                "kind": "account",
                "path": "merchantAddress"
              }
            ]
          }
        },
        {
          "name": "merchantRegistration"
        },
        {
          "name": "merchantAddress",
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
          "name": "planName",
          "type": "string"
        },
        {
          "name": "planPrice",
          "type": "u64"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "billingCycle",
          "type": "u8"
        },
        {
          "name": "supportedTokens",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "isActive",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initializeUserSubscription",
      "discriminator": [
        202,
        177,
        36,
        216,
        151,
        191,
        19,
        83
      ],
      "accounts": [
        {
          "name": "userSubscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "subscriptionPlan"
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        },
        {
          "name": "subscriptionPlan"
        },
        {
          "name": "merchantRegistration"
        },
        {
          "name": "subscriber",
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
          "name": "nextBillingDate",
          "type": "i64"
        },
        {
          "name": "isActive",
          "type": "bool"
        },
        {
          "name": "supportedTokens",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "merchantRegistration",
      "discriminator": [
        52,
        168,
        1,
        47,
        65,
        242,
        88,
        60
      ]
    },
    {
      "name": "paymentTransaction",
      "discriminator": [
        70,
        221,
        6,
        3,
        5,
        162,
        149,
        177
      ]
    },
    {
      "name": "subscriptionPlan",
      "discriminator": [
        157,
        153,
        188,
        46,
        234,
        53,
        172,
        124
      ]
    },
    {
      "name": "userSubscription",
      "discriminator": [
        108,
        179,
        18,
        43,
        167,
        65,
        185,
        163
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "paymentTransactionAlreadyExists",
      "msg": "Payment transaction already exists."
    },
    {
      "code": 6001,
      "name": "invalidPaymentTransactionDetails",
      "msg": "Invalid payment transaction details provided."
    },
    {
      "code": 6002,
      "name": "paymentTransactionLimitReached",
      "msg": "Payment transaction limit reached."
    },
    {
      "code": 6003,
      "name": "unauthorizedPaymentTransactionAccess",
      "msg": "Unauthorized access to payment transaction data."
    },
    {
      "code": 6004,
      "name": "paymentTransactionNotFound",
      "msg": "Payment transaction not found."
    },
    {
      "code": 6005,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for the transaction."
    }
  ],
  "types": [
    {
      "name": "merchantRegistration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchantName",
            "type": "string"
          },
          {
            "name": "merchantAddress",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "merchantWeburl",
            "type": "string"
          },
          {
            "name": "supportedTokens",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "paymentTransaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "txSignature",
            "type": "string"
          },
          {
            "name": "payerAddress",
            "type": "pubkey"
          },
          {
            "name": "merchantAddress",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "subscriptionPlan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "planName",
            "type": "string"
          },
          {
            "name": "planPrice",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "billingCycle",
            "type": "u8"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "merchantAddress",
            "type": "pubkey"
          },
          {
            "name": "supportedTokens",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "userSubscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "subscriptionPlan",
            "type": "pubkey"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "nextBillingDate",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "merchantAddress",
            "type": "pubkey"
          },
          {
            "name": "supportedTokens",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "canceledAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    }
  ]
};

```