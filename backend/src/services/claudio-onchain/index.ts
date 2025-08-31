import { 
  CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS, 
  publicClient,
  createWalletClient as createWallet,
  contractABI 
} from "../../onchain";

export interface Agreement {
  employer: string;
  coworker: string;
  employerSigned: boolean;
  coworkerSigned: boolean;
  createdAt: bigint;
  exists: boolean;
}

export class ClaudioOnchainService {
  private static instance: ClaudioOnchainService;
  private walletClient: any;

  constructor() {
    try {
      this.walletClient = createWallet();
    } catch (error) {
      console.warn('Wallet client not initialized. Private key may be missing.');
    }
  }

  public static getInstance(): ClaudioOnchainService {
    if (!ClaudioOnchainService.instance) {
      ClaudioOnchainService.instance = new ClaudioOnchainService();
    }

    return ClaudioOnchainService.instance;
  }

  public async createAgreement(
    caseId: string,
    employerAddress: string,
    coworkerAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized. Check CLAUDIO_PK environment variable.');
      }

      console.log('Creating agreement on blockchain:', {
        caseId,
        employerAddress,
        coworkerAddress,
        contract: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS
      });

      // First check if agreement already exists
      const existingAgreement = await this.getAgreement(caseId);
      if (existingAgreement.exists) {
        console.log('Agreement already exists:', caseId);
        return { 
          success: true, 
          txHash: 'already-exists',
          error: 'Agreement already exists on blockchain' 
        };
      }

      // Create the agreement on blockchain
      const txHash = await this.walletClient.writeContract({
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'createAgreement',
        args: [caseId, employerAddress, coworkerAddress],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: txHash 
      });

      console.log('Agreement created successfully:', {
        caseId,
        txHash,
        blockNumber: receipt.blockNumber
      });

      return { 
        success: true, 
        txHash: receipt.transactionHash 
      };

    } catch (error: any) {
      console.error('Error creating agreement:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }
  }

  public async getAgreement(caseId: string): Promise<Agreement> {
    try {
      const result = await publicClient.readContract({
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'getAgreement',
        args: [caseId],
      });

      const agreement = result as {
        employer: string;
        coworker: string;
        employerSigned: boolean;
        coworkerSigned: boolean;
        createdAt: bigint;
        exists: boolean;
      };

      return {
        employer: agreement.employer,
        coworker: agreement.coworker,
        employerSigned: agreement.employerSigned,
        coworkerSigned: agreement.coworkerSigned,
        createdAt: agreement.createdAt,
        exists: agreement.exists,
      };
    } catch (error) {
      console.error('Error reading agreement:', error);
      // Return empty agreement if not found
      return {
        employer: '',
        coworker: '',
        employerSigned: false,
        coworkerSigned: false,
        createdAt: BigInt(0),
        exists: false,
      };
    }
  }

  public async isAgreementCompleted(caseId: string): Promise<boolean> {
    try {
      const result = await publicClient.readContract({
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'isCompleted',
        args: [caseId],
      });

      return result as boolean;
    } catch (error) {
      console.error('Error checking completion:', error);
      return false;
    }
  }

  public getContractAddress(): string {
    return CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS;
  }

  public getWalletAddress(): string | null {
    return this.walletClient?.account?.address || null;
  }
}

export const claudioOnchainService = ClaudioOnchainService.getInstance();
