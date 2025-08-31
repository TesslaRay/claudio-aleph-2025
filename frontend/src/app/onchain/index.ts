import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "../../../config";
import contractABI from "../../../contract/ClaudioLegalAgreement.json";

export const CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS =
  "0x363203d21835547daebe7f8fc074a20c958b0965";

export interface Agreement {
  employer: string;
  coworker: string;
  employerSigned: boolean;
  coworkerSigned: boolean;
  createdAt: bigint;
  exists: boolean;
}

export async function getAgreement(caseId: string): Promise<Agreement> {
  try {
    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "getAgreement",
      args: [caseId],
    });

    // The contract returns a struct/object, not an array
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
    console.error("Error reading agreement:", error);
    throw error;
  }
}

export async function signAgreement(caseId: string): Promise<string> {
  try {
    const hash = await writeContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "signAgreement",
      args: [caseId],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(config, {
      hash,
    });

    return receipt.transactionHash;
  } catch (error) {
    console.error("Error signing agreement:", error);
    throw error;
  }
}

export async function hasSignedAgreement(
  caseId: string,
  signerAddress: string
): Promise<boolean> {
  try {
    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "hasSigned",
      args: [caseId, signerAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking signature:", error);
    throw error;
  }
}

export async function isAgreementCompleted(caseId: string): Promise<boolean> {
  try {
    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "isCompleted",
      args: [caseId],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking completion:", error);
    throw error;
  }
}
