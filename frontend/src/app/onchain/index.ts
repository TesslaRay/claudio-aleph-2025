import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "../../../config";
import contractABI from "../../../contract/ClaudioLegalAgreement.json";
import { keccak256, toBytes } from "viem";

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
    // Convert caseId to bytes32 hash
    const caseIdHash = keccak256(toBytes(caseId));

    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "getAgreement",
      args: [caseIdHash],
    });

    // The contract returns an object with named properties
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
    // Convert caseId to bytes32 hash
    const caseIdHash = keccak256(toBytes(caseId));

    const hash = await writeContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "signAgreement",
      args: [caseIdHash],
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
    // Convert caseId to bytes32 hash
    const caseIdHash = keccak256(toBytes(caseId));

    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "hasSigned",
      args: [caseIdHash, signerAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking signature:", error);
    throw error;
  }
}

export async function isAgreementCompleted(caseId: string): Promise<boolean> {
  try {
    // Convert caseId to bytes32 hash
    const caseIdHash = keccak256(toBytes(caseId));

    const result = await readContract(config, {
      chainId: 8453,
      address: CLAUDIO_LEGAL_AGREEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: contractABI,
      functionName: "isFullySigned",
      args: [caseIdHash],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking completion:", error);
    throw error;
  }
}
