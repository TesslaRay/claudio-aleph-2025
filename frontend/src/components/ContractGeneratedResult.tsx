"use client";

// react
import React from "react";

// next
import Image from "next/image";
import Link from "next/link";

interface ContractData {
  name: string;
  type: string;
  url: string;
  filename: string;
  size: number;
}

interface ContractGeneratedResultProps {
  contract: ContractData;
  caseId: string;
}

export default function ContractGeneratedResult({
  contract,
  caseId,
}: ContractGeneratedResultProps) {
  console.log("caseId", caseId);

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <div className="flex w-full mb-6">
      <div className="flex items-start mr-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F4F4F4] text-black text-2xl font-bold select-none mt-3"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
          }}
        >
          C
        </div>
      </div>

      <div className="flex flex-col w-full ml-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Contrato Generado
          </h3>

          <p className="text-sm text-gray-600">
            Tu contrato ha sido generado exitosamente y registrado en
            blockchain. También puedes encontrarlo en tu Vault.
          </p>
        </div>

        <Link href={`/contract/${caseId}`} target="_blank">
          <div className="space-y-3">
            <div
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm w-full max-w-md hover:shadow-md transition-shadow cursor-pointer"
              role="button"
              aria-label={`Abrir ${contract.name}`}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/images/pdf.svg"
                  alt="PDF"
                  width={32}
                  height={32}
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-lg font-semibold truncate">
                  {contract.name}
                </span>

                <span className="text-sm text-gray-500 truncate mt-1">
                  {contract.type.charAt(0).toUpperCase() +
                    contract.type.slice(1)}{" "}
                  · {formatFileSize(contract.size)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
