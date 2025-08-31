import { createPublicClient, createWalletClient as viemCreateWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { contractABI } from './contractABI.js';

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
  
  console.log('Creating wallet client...');
  console.log('Private key exists:', !!privateKey);
  console.log('Private key length:', privateKey?.length);
  
  if (!privateKey) {
    throw new Error('CLAUDIO_PK environment variable is required');
  }

  // Add '0x' prefix if not present
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  console.log('Formatted key length:', formattedKey.length);
  
  try {
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    console.log('Account created:', account.address);
    
    const walletClient = viemCreateWalletClient({
      account,
      chain: base,
      transport: http()
    });
    
    console.log('Wallet client created successfully');
    return walletClient;
  } catch (error) {
    console.error('Error creating wallet client:', error);
    throw error;
  }
};

export { contractABI };
