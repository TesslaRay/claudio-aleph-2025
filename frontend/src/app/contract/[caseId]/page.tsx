"use client";

// react
import { useState, useEffect, useRef } from "react";

// next
import { useParams } from "next/navigation";
import Image from "next/image";

// wagmi
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

// services
import { claudioService } from "@/services/claudio.service";

// utils
import { formatAddress } from "@/utils/format-address";

// icons
import { FiCopy, FiCheck } from "react-icons/fi";

// Types
interface Contract {
  id: string;
  name: string;
  url: string;
  size: number;
  timestamp: number;
  description?: string;
  metadata?: {
    employer_address?: string;
    coworker_address?: string;
    [key: string]: any;
  };
}

interface CaseInfo {
  caseId: string;
  userAddress: string;
  conversationHistory: any[];
}

interface ContractData {
  success: boolean;
  contract: Contract;
  case: CaseInfo;
}

interface Activity {
  id: string;
  type: "created" | "viewed" | "signed" | "completed" | "sent";
  user: string;
  timestamp: number;
  description: string;
}

export default function ContractPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showPdfViewer] = useState(true);
  const [signing, setSigning] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "document" | "details" | "history"
  >("document");
  const [copied, setCopied] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caseId) {
      loadContract();
      loadActivities();
      trackView();
    }
  }, [caseId]);

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

  const loadContract = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await claudioService.getContractByCaseId(caseId);

      console.log("Contract response:", response);

      if (response.success) {
        setContractData(response);
        // Load signatures from localStorage for demo
        const savedSignatures = localStorage.getItem(`signatures-${caseId}`);
        if (savedSignatures) {
          setSignatures(JSON.parse(savedSignatures));
        }
      } else {
        setError(response.error || "Contract not found");
      }
    } catch (err) {
      console.error("Error loading contract:", err);
      setError("Error loading contract");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = () => {
    // Load activities from localStorage for demo
    const savedActivities = localStorage.getItem(`activities-${caseId}`);
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      // Initialize with document creation activity
      const initialActivities: Activity[] = [
        {
          id: "1",
          type: "created",
          user: "Claudio",
          timestamp: Date.now() - 86400000, // 1 day ago
          description: "Contrato generado automáticamente",
        },
        {
          id: "2",
          type: "sent",
          user: "Claudio",
          timestamp: Date.now() - 85000000,
          description: "Enviado para firma a las partes",
        },
      ];
      setActivities(initialActivities);
      localStorage.setItem(
        `activities-${caseId}`,
        JSON.stringify(initialActivities)
      );
    }
  };

  const trackView = () => {
    const viewKey = `viewed-${caseId}-${address || "anonymous"}`;
    if (!localStorage.getItem(viewKey)) {
      localStorage.setItem(viewKey, "true");
      if (address) {
        addActivity(
          "viewed",
          `${address.slice(0, 6)}...${address.slice(-4)}`,
          "Documento visualizado"
        );
      }
    }
  };

  const addActivity = (
    type: Activity["type"],
    user: string,
    description: string
  ) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      user,
      timestamp: Date.now(),
      description,
    };
    const savedActivities = localStorage.getItem(`activities-${caseId}`);
    const currentActivities = savedActivities
      ? JSON.parse(savedActivities)
      : [];
    const updatedActivities = [newActivity, ...currentActivities];
    setActivities(updatedActivities);
    localStorage.setItem(
      `activities-${caseId}`,
      JSON.stringify(updatedActivities)
    );
  };

  const handleSign = async () => {
    if (!address || !isConnected) {
      await connect({ connector: injected() });
      return;
    }

    // Check if current user is authorized to sign
    if (!isAuthorizedUser) {
      return;
    }

    setSigning(true);
    // Simulate signature process with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newSignatures = [...signatures];
    if (
      !newSignatures.some((sig) => sig.toLowerCase() === address.toLowerCase())
    ) {
      newSignatures.push(address);
      setSignatures(newSignatures);
      localStorage.setItem(
        `signatures-${caseId}`,
        JSON.stringify(newSignatures)
      );

      // Determine role for activity
      const userRole =
        address.toLowerCase() ===
        contractData?.contract.metadata?.employer_address?.toLowerCase()
          ? "Empleador"
          : "Colaborador";

      // Add activity
      addActivity(
        "signed",
        `${address.slice(0, 6)}...${address.slice(-4)} (${userRole})`,
        "Documento firmado electrónicamente con wallet"
      );

      // Check if all parties have signed
      const updatedRequiredSigners = requiredSigners.map((signer) => ({
        ...signer,
        signed:
          signer.signed ||
          signer.address?.toLowerCase() === address.toLowerCase(),
      }));

      const allSigned = updatedRequiredSigners.every((signer) => signer.signed);

      if (allSigned) {
        setTimeout(() => {
          addActivity(
            "completed",
            "Claudio System",
            "Todas las partes han firmado. Contrato completado."
          );
        }, 500);
      }
    }
    setSigning(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWalletToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(2)} MB`;
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Hace un momento";
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    return `Hace ${days} día${days > 1 ? "s" : ""}`;
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "created":
        return "📄";
      case "sent":
        return "📤";
      case "viewed":
        return "👁️";
      case "signed":
        return "✍️";
      case "completed":
        return "✅";
      default:
        return "📝";
    }
  };

  const getStatusColor = (type: Activity["type"]) => {
    switch (type) {
      case "created":
        return "bg-gray-100 text-gray-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "viewed":
        return "bg-purple-100 text-purple-700";
      case "signed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Check if current user is authorized (employer or coworker)
  const isAuthorizedUser =
    address &&
    contractData?.contract.metadata &&
    (address.toLowerCase() ===
      contractData.contract.metadata.employer_address?.toLowerCase() ||
      address.toLowerCase() ===
        contractData.contract.metadata.coworker_address?.toLowerCase());

  // Get required signers from metadata
  const requiredSigners = contractData?.contract.metadata
    ? [
        {
          address: contractData.contract.metadata.employer_address,
          role: "Empleador",
          signed: signatures.some(
            (sig) =>
              sig.toLowerCase() ===
              contractData.contract.metadata?.employer_address?.toLowerCase()
          ),
        },
        {
          address: contractData.contract.metadata.coworker_address,
          role: "Colaborador",
          signed: signatures.some(
            (sig) =>
              sig.toLowerCase() ===
              contractData.contract.metadata?.coworker_address?.toLowerCase()
          ),
        },
      ].filter((signer) => signer.address)
    : [];

  const isUserSigned =
    address &&
    requiredSigners.some(
      (signer) =>
        signer.address?.toLowerCase() === address.toLowerCase() && signer.signed
    );
  const completedSignatures = requiredSigners.filter(
    (signer) => signer.signed
  ).length;
  const totalRequiredSignatures = requiredSigners.length || 2;
  const isCompleted = completedSignatures >= totalRequiredSignatures;
  const completionPercentage =
    totalRequiredSignatures > 0
      ? Math.min((completedSignatures / totalRequiredSignatures) * 100, 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-slate-200 mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">
            Cargando documento...
          </p>
        </div>
      </div>
    );
  }

  if (error || !contractData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Documento no encontrado
          </h1>
          <p className="text-gray-600">
            {error || "El documento solicitado no existe"}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authorized to view this contract
  // Show access denied if user is connected but not authorized
  if (isConnected && address && !isAuthorizedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="text-amber-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso no autorizado
          </h1>
          <p className="text-gray-600 mb-4">
            Solo las partes autorizadas pueden acceder a este contrato.
          </p>
          <p className="text-sm text-gray-500">
            Dirección actual: {formatAddress(address)}
          </p>
          <button
            onClick={() => disconnect()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Desconectar Wallet
          </button>
        </div>
      </div>
    );
  }

  // Show connection prompt if user is not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="text-blue-500 text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conecta tu Wallet
          </h1>
          <p className="text-gray-600 mb-4">
            Para acceder a este contrato, conecta tu wallet para verificar tu
            identidad.
          </p>
          <button
            onClick={() => connect({ connector: injected() })}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            🔗 Conectar Wallet
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Solo las partes autorizadas pueden acceder
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/assets/images/logo/black.png"
                  alt="Claudio"
                  width={32}
                  height={32}
                />
              </div>

              <p className="font-bold text-black">Claudio</p>
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center space-x-4">
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {isCompleted ? "✅ Completado" : "⏳ Pendiente de firmas"}
              </div>
            </div>

            {/* Wallet Connection - DashboardHeader Style */}
            <div className="flex items-center space-x-4">
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
                            onClick={() => copyWalletToClipboard(address)}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title="Copy address"
                          >
                            {copiedWallet ? (
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
                        Desconectar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => connect({ connector: injected() })}
                  className="px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white"
                  title="Connect your wallet"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Title and Actions */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contrato de Prestación de Servicios
              </h1>
              <p className="mt-1 text-gray-500">
                Caso ID: <span className="font-mono text-sm">{caseId}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>{copied ? "✅" : "🔗"}</span>
                <span className="text-sm font-medium">
                  {copied ? "Copiado!" : "Compartir"}
                </span>
              </button>
              <a
                href={contractData.contract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>⬇️</span>
                <span className="text-sm font-medium">Descargar PDF</span>
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso de firmas
              </span>
              <span className="text-sm font-bold text-blue-600">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {completedSignatures} de {totalRequiredSignatures} firmas
                requeridas
              </span>
              {isCompleted && (
                <span className="text-xs text-green-600 font-medium">
                  ✅ Todas las partes han firmado
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - PDF Viewer / Details */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-t-xl border-b">
              <div className="flex space-x-1 p-1">
                <button
                  onClick={() => setActiveTab("document")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "document"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  📄 Documento
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "details"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  ℹ️ Detalles
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  🕐 Historial
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl shadow-sm">
              {activeTab === "document" && (
                <div className="p-6">
                  {showPdfViewer ? (
                    <div
                      className="bg-gray-100 rounded-lg"
                      style={{ height: "600px" }}
                    >
                      <iframe
                        src={`${contractData.contract.url}#toolbar=0`}
                        className="w-full h-full rounded-lg"
                        title="Contract PDF"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                      <span className="text-6xl mb-4">📄</span>
                      <p className="text-lg font-medium">
                        Vista previa no disponible
                      </p>
                      <a
                        href={contractData.contract.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Abrir PDF en nueva pestaña
                      </a>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Nombre del archivo
                      </p>
                      <p className="font-medium text-gray-900">
                        {contractData.contract.name}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tamaño</p>
                      <p className="font-medium text-gray-900">
                        {formatFileSize(contractData.contract.size)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Fecha de creación
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(contractData.contract.timestamp)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Solicitante</p>
                      <p className="font-medium text-gray-900 font-mono text-sm">
                        {contractData.case.userAddress.slice(0, 10)}...
                        {contractData.case.userAddress.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Parties Information */}
                  {contractData.contract.metadata && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Partes del Contrato
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {contractData.contract.metadata.employer_address && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-600 mb-1">
                                  Empleador
                                </p>
                                <p className="font-medium text-gray-900 font-mono text-sm">
                                  {
                                    contractData.contract.metadata
                                      .employer_address
                                  }
                                </p>
                              </div>
                              <div className="text-blue-600">💼</div>
                            </div>
                          </div>
                        )}

                        {contractData.contract.metadata.coworker_address && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-green-600 mb-1">
                                  Colaborador
                                </p>
                                <p className="font-medium text-gray-900 font-mono text-sm">
                                  {
                                    contractData.contract.metadata
                                      .coworker_address
                                  }
                                </p>
                              </div>
                              <div className="text-green-600">👤</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {contractData.contract.description && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Descripción</p>
                      <p className="text-gray-900">
                        {contractData.contract.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="p-6">
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-xl">
                            {getActivityIcon(activity.type)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Por: {activity.user} •{" "}
                                {getRelativeTime(activity.timestamp)}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                activity.type
                              )}`}
                            >
                              {activity.type === "created" && "Creado"}
                              {activity.type === "sent" && "Enviado"}
                              {activity.type === "viewed" && "Visto"}
                              {activity.type === "signed" && "Firmado"}
                              {activity.type === "completed" && "Completado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Signatures */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-6">
              {/* Header */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Panel de Firmas
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona las firmas del documento
                </p>
              </div>

              {/* Sign Button */}
              <div className="p-6 border-b">
                {isUserSigned ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="font-semibold text-green-700">
                      Ya has firmado el documento
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Firmado con wallet: {formatAddress(address || "")}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={handleSign}
                      disabled={signing}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        signing
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 cursor-pointer"
                      }`}
                    >
                      {signing ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Firmando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          ✍️ Firmar Documento
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Al firmar, aceptas los términos del contrato
                    </p>
                  </div>
                )}
              </div>

              {/* Signatures List */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Firmantes ({completedSignatures}/{totalRequiredSignatures})
                  </h4>
                  <p className="text-xs text-gray-500">
                    Se requieren {totalRequiredSignatures} firmas para completar
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    {requiredSigners.map((signer, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          signer.signed
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              signer.signed ? "bg-green-100" : "bg-gray-200"
                            }`}
                          >
                            <span className="text-sm">
                              {signer.signed ? "✓" : "○"}
                            </span>
                          </div>
                          <div>
                            <p
                              className={`font-medium text-sm ${
                                signer.signed
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {signer.role}{" "}
                              {signer.address?.toLowerCase() ===
                              address?.toLowerCase()
                                ? "(Tu)"
                                : ""}
                            </p>
                            <p
                              className={`text-xs font-mono ${
                                signer.signed
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {signer.address
                                ? `${signer.address.slice(
                                    0,
                                    6
                                  )}...${signer.address.slice(-4)}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            signer.signed ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {signer.signed ? "Firmado" : "Esperando"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate Status */}
                {isCompleted && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="font-semibold text-green-800">
                          Documento Completado
                        </p>
                        <p className="text-xs text-green-600">
                          Todas las firmas han sido recolectadas
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
