import {
  CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS,
  publicClient,
  createWalletClient as createWallet,
  contractABI,
  keccak256,
  toBytes,
} from "../../onchain/index.js";

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
      console.log("Initializing wallet client...");
      console.log("CLAUDIO_PK exists:", !!process.env.CLAUDIO_PK);
      console.log("CLAUDIO_PK length:", process.env.CLAUDIO_PK?.length);
      this.walletClient = createWallet();
      console.log("Wallet client initialized successfully");
    } catch (error) {
      console.error("Wallet client initialization failed:", error);
      console.warn(
        "Wallet client not initialized. Private key may be missing."
      );
      this.walletClient = null;
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
        throw new Error(
          "Wallet client not initialized. Check CLAUDIO_PK environment variable."
        );
      }

      // Convert caseId to bytes32 hash
      const caseIdHash = keccak256(toBytes(caseId));

      console.log("Creating agreement on blockchain:", {
        caseId,
        caseIdHash,
        employerAddress,
        coworkerAddress,
        contract: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS,
      });

      // First check if agreement already exists
      const existingAgreement = await this.getAgreement(caseId);
      if (existingAgreement.exists) {
        console.log("Agreement already exists:", caseId);
        return {
          success: true,
          txHash: "already-exists",
          error: "Agreement already exists on blockchain",
        };
      }

      // Validate addresses
      if (!employerAddress || !coworkerAddress) {
        throw new Error('Employer and coworker addresses are required');
      }
      
      if (employerAddress.length !== 42 || !employerAddress.startsWith('0x')) {
        throw new Error('Invalid employer address format');
      }
      
      if (coworkerAddress.length !== 42 || !coworkerAddress.startsWith('0x')) {
        throw new Error('Invalid coworker address format');
      }

      console.log('About to call writeContract with:', {
        chainId: 8453,
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS,
        functionName: 'createAgreement',
        args: [caseIdHash, employerAddress, coworkerAddress]
      });

      // Create the agreement on blockchain
      const txHash = await this.walletClient.writeContract({
        chainId: 8453,
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: "createAgreement",
        args: [
          caseIdHash,
          employerAddress as `0x${string}`,
          coworkerAddress as `0x${string}`,
        ],
      });
      
      console.log('writeContract returned txHash:', txHash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log("Agreement created successfully:", {
        caseId,
        txHash,
        blockNumber: receipt.blockNumber,
      });

      return {
        success: true,
        txHash: receipt.transactionHash,
      };
    } catch (error: any) {
      console.error("Error creating agreement:", {
        message: error.message,
        code: error.code,
        details: error.details,
        cause: error.cause,
        shortMessage: error.shortMessage,
        stack: error.stack
      });
      
      return {
        success: false,
        error: error.shortMessage || error.message || "Unknown error occurred",
      };
    }
  }

  public async getAgreement(caseId: string): Promise<Agreement> {
    try {
      // Convert caseId to bytes32 hash
      const caseIdHash = keccak256(toBytes(caseId));

      const result = await publicClient.readContract({
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: "getAgreement",
        args: [caseIdHash],
      });

      const [
        employer,
        coworker,
        employerSigned,
        coworkerSigned,
        createdAt,
        exists,
      ] = result as readonly [
        `0x${string}`,
        `0x${string}`,
        boolean,
        boolean,
        bigint,
        boolean
      ];

      return {
        employer,
        coworker,
        employerSigned,
        coworkerSigned,
        createdAt,
        exists,
      };
    } catch (error) {
      console.error("Error reading agreement:", error);
      // Return empty agreement if not found
      return {
        employer: "",
        coworker: "",
        employerSigned: false,
        coworkerSigned: false,
        createdAt: BigInt(0),
        exists: false,
      };
    }
  }

  public async isAgreementCompleted(caseId: string): Promise<boolean> {
    try {
      // Convert caseId to bytes32 hash
      const caseIdHash = keccak256(toBytes(caseId));

      const result = await publicClient.readContract({
        address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: "isFullySigned",
        args: [caseIdHash],
      });

      return result as boolean;
    } catch (error) {
      console.error("Error checking completion:", error);
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

// Service instance will be created on first use to allow env variables to load
export const claudioOnchainService = {
  getInstance: () => ClaudioOnchainService.getInstance(),
};
