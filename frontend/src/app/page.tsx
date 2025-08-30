"use client";

// React
import { useState } from "react";

// Wagmi Hooks
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { injected } from "wagmi/connectors";

// Contract information Address and ABI
const SIMPLE_STORAGE_CONTRACT_ADDRESS =
  "0xcb8b8317ef7e5f5afb641813e07177cbd791bf8e";
import SimpleStorageContractABI from "../../contract/SimpleStorageContractABI.json";

// Config
import { config } from "../../config";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [currentValue, setCurrentValue] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const handleReadValue = async () => {
    try {
      setIsLoading(true);
      const result = await readContract(config, {
        abi: SimpleStorageContractABI,
        address: SIMPLE_STORAGE_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get",
      });
      setCurrentValue(result as bigint);
    } catch (error) {
      console.error("Error al leer el valor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteValue = async () => {
    try {
      setIsWriting(true);
      await writeContract(config, {
        abi: SimpleStorageContractABI,
        address: SIMPLE_STORAGE_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "set",
        args: [BigInt(newValue)],
      });
      setNewValue("");
      handleReadValue();
    } catch (error) {
      console.error("Error al escribir el valor:", error);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 relative"
      style={{
        backgroundImage: "url('/assets/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="text-center space-y-4 relative z-10">
        <h1 className="text-5xl font-bold text-white">Simple Storage dApp</h1>

        <p className="text-gray-200">
          Aplicación de ejemplo para interactuar con un contrato inteligente en
          Base.
        </p>
      </div>
      <div className="flex gap-3 relative z-10">
        <a
          href="https://basescan.org/address/0xcb8b8317ef7e5f5afb641813e07177cbd791bf8e"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Ver en BaseScan
        </a>
      </div>
      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl relative z-10"
        >
          Conectar Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl relative z-10">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                Conectado: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Desconectar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box de Lectura */}
              <div className="bg-white/80 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Leer Valor
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-2">Valor actual:</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currentValue?.toString() ?? "No leído"}
                    </p>
                  </div>
                  <button
                    onClick={handleReadValue}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Leyendo...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Leer Valor
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box de Escritura */}
              <div className="bg-white/80 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Escribir Valor
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Nuevo valor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    />
                    <button
                      onClick={handleWriteValue}
                      disabled={!newValue || isWriting}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {isWriting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Escribiendo...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Escribir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
