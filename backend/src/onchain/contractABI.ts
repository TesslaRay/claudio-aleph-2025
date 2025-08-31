export const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_claudioAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "caseId", "type": "bytes32" }
    ],
    "name": "AgreementAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "caseId", "type": "bytes32" }
    ],
    "name": "AgreementNotFound",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "caseId", "type": "bytes32" },
      { "internalType": "address", "name": "signer", "type": "address" }
    ],
    "name": "AlreadySigned",
    "type": "error"
  },
  { "inputs": [], "name": "InvalidAddress", "type": "error" },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "NotAuthorizedCreator",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "caseId", "type": "bytes32" },
      { "internalType": "address", "name": "signer", "type": "address" }
    ],
    "name": "NotAuthorizedSigner",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "caseId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "coworker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AgreementCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "caseId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AgreementSigned",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "name": "agreements",
    "outputs": [
      { "internalType": "address", "name": "employer", "type": "address" },
      { "internalType": "address", "name": "coworker", "type": "address" },
      {
        "internalType": "bool",
        "name": "employerSigned",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "coworkerSigned",
        "type": "bool"
      },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claudioAddress",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_caseId", "type": "bytes32" },
      {
        "internalType": "address",
        "name": "_employer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_coworker",
        "type": "address"
      }
    ],
    "name": "createAgreement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_caseId", "type": "bytes32" }
    ],
    "name": "getAgreement",
    "outputs": [
      { "internalType": "address", "name": "employer", "type": "address" },
      { "internalType": "address", "name": "coworker", "type": "address" },
      {
        "internalType": "bool",
        "name": "employerSigned",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "coworkerSigned",
        "type": "bool"
      },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_caseId", "type": "bytes32" }
    ],
    "name": "isFullySigned",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_caseId", "type": "bytes32" }
    ],
    "name": "signAgreement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;