export const apiConfig = {
  apiUrl: "http://localhost:3000",

  endpoints: {
    claudio: {
      chat: "/claudio/chat",
      getContract: "/claudio/contract",
    },
    conversation: {
      lastActiveCase: "/conversation/last-active-case-conversation",
    },
    vault: {
      getUserVaultFiles: "/vault/user-vault-files",
    },
  },
};
