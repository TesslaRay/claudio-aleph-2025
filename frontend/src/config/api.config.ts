export const apiConfig = {
  apiUrl: "http://localhost:3000",

  endpoints: {
    claudio: {
      chat: "/claudio/chat",
      getContract: "/claudio/contract",
      generateContract: "/claudio/generate-contract-for-case",
    },
    conversation: {
      lastActiveCase: "/conversation/last-active-case-conversation",
    },
    vault: {
      getUserVaultFiles: "/vault/user-vault-files",
    },
    cases: {
      newCase: "/cases",
    },
  },
};
