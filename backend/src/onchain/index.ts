import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import contractABI from './ClaudioLegalAgreement.json';

export const CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS =
  "0x363203d21835547daebe7f8fc074a20c958b0965";

// Setup clients for Base network
export const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Wallet client will be created with private key from environment
export const createWalletClient = () => {
  const privateKey = process.env.CLAUDIO_PK;
  
  if (!privateKey) {
    throw new Error('CLAUDIO_PK environment variable is required');
  }

  // Add '0x' prefix if not present
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedKey as `0x${string}`);
  
  return createWalletClient({
    account,
    chain: base,
    transport: http()
  });
};

export { contractABI };
