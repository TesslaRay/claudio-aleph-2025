"use client";

// react
import { useState, useEffect, useRef } from "react";

// next
import { usePathname } from "next/navigation";

// icons
import { LuSquarePen, LuPanelLeft, LuBriefcase } from "react-icons/lu";
import { FiCopy, FiCheck } from "react-icons/fi";

// wagmi
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

// utils
import { formatAddress } from "../utils/format-address";

// shadcn/ui
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * DashboardHeader component that displays the header section with dynamic title based on route
 * @param onNewCase Callback for creating a new case
 * @param onShowAdvanced Callback for showing advanced (case facts) panel
 */
export default function DashboardHeader({
  onNewCase,
  onShowAdvanced,
  showUcsPanel,
}: {
  onNewCase?: () => void;
  onShowAdvanced?: () => void;
  showUcsPanel?: boolean;
}) {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Determine the title based on the current route
  const getTitle = () => {
    if (pathname === "/chat-provisory") {
      return "Asistente";
    }

    if (pathname === "/cases") {
      return "Casos";
    }

    if (pathname === "/vault") {
      return "Bóveda";
    }

    if (pathname === "/settings") {
      return "Configuración";
    }

    return "Asistente";
  };

  // Check if we're in agent view (including specific cases)
  const isAgentView =
    pathname === "/agent" || pathname.startsWith("/agent/case/");

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDisconnect(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-300 bg-white">
      <div className="w-full pl-[20px] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg text-gray-600 mb-1">{getTitle()} /</h2>
        </div>

        <div className="flex items-center space-x-4">
          {isAgentView && onNewCase && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="ml-2 px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white flex items-center gap-2"
                  title="New Case"
                  variant="default"
                >
                  <LuSquarePen size={18} />
                  Nuevo Caso
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">
                    Elige tu Asistente Legal
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-base">
                    Selecciona el agente especializado que mejor se adapte a las
                    necesidades de tu caso.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
                  <div
                    className="border rounded-lg p-4 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                    onClick={() => {
                      // Here you can add logic to differentiate between agents
                      // For now, calling the original onNewCase function
                      onNewCase();
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                        <LuBriefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          Tomas
                        </h3>

                        <p className="text-sm text-gray-600 mb-2">
                          Asociado Junior - Práctica General
                        </p>

                        <p className="text-sm text-gray-700 mb-3">
                          Un asociado junior versátil que se especializa en nada
                          pero sabe de todo. Perfecto para investigación y casos
                          que requieren conocimiento legal amplio.
                        </p>

                        <div className="text-sm">
                          <p className="text-gray-700 font-semibold mb-2">
                            Capaz de realizar:
                          </p>
                          <ul className="text-gray-600 space-y-1 ml-2">
                            <li>• Consultas generales</li>
                            <li>• Asesoría inicial</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Advanced button only in assistant view */}
          {isAgentView && onShowAdvanced && (
            <Button
              className="ml-2 px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white flex items-center gap-2"
              title={showUcsPanel ? "Simple" : "Ver detalles"}
              variant="default"
              onClick={onShowAdvanced}
            >
              <LuPanelLeft size={18} />
              {showUcsPanel ? "Simple" : "Ver detalles"}
            </Button>
          )}

          {/* Wallet connection display */}
          {isConnected && address ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDisconnect(!showDisconnect)}
                className="px-4 py-1.5 rounded-[10px] font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                {formatAddress(address)}
              </button>

              {showDisconnect && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">
                        Wallet Address
                      </span>

                      <button
                        onClick={() => copyToClipboard(address)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Copy address"
                      >
                        {copied ? (
                          <FiCheck className="text-green-500 cursor-pointer" />
                        ) : (
                          <FiCopy className="text-gray-500 cursor-pointer" />
                        )}
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 break-all">
                      {address}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      disconnect();
                      setShowDisconnect(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white"
              title="Connect your wallet"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
